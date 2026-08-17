'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { Post, Comment, ReactionType, Poll, Story } from '@/components/community/types';
import { COMMUNITY_FALLBACK_NAME } from '@/components/community/types';

// ─── Shared shapes ───────────────────────────────────────────────────

const EMPTY_REACTIONS: Record<ReactionType, number> = {
    like: 0, love: 0, celebrate: 0, insightful: 0, funny: 0, growth: 0,
};

interface AuthorRow {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    farm_location: string | null;
    role: string | null;
}

interface PostRow {
    id: string;
    user_id: string;
    content: string;
    images: string[] | null;
    video: string | null;
    location: string | null;
    tags: string[] | null;
    poll_options: string[] | null;
    created_at: string;
}

const POST_COLUMNS = 'id, user_id, content, images, video, location, tags, poll_options, created_at';
/** Pre-028 column list, used only if the poll migration has not been applied yet. */
const POST_COLUMNS_LEGACY = 'id, user_id, content, images, video, location, tags, created_at';
/** Postgres: undefined_column. */
const UNDEFINED_COLUMN = '42703';

export interface CommunityUser {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    location: string;
    role: string;
    postCount: number;
    followerCount?: number;
    isFollowing?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Facebook-style relative time: "Just now", "5m", "2h", "3d", then a date. */
function relativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    const seconds = Math.floor((Date.now() - then) / 1000);

    if (!Number.isFinite(seconds) || seconds < 0) return 'Just now';
    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

    const weeks = Math.floor(days / 7);
    if (days < 30) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

    // Older than a month reads as a date, like Facebook.
    const date = new Date(iso);
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        ...(sameYear ? {} : { year: 'numeric' }),
    });
}

function handleFor(author: AuthorRow | undefined, userId: string): string {
    return author?.username || `farmer_${userId.replace(/-/g, '').slice(0, 6)}`;
}

function displayName(author: AuthorRow | undefined): string {
    return author?.full_name?.trim() || COMMUNITY_FALLBACK_NAME;
}

// ─── Feed ────────────────────────────────────────────────────────────

export interface FetchFeedOptions {
    limit?: number;
    /** How many posts to skip — the cursor for "Load more". */
    offset?: number;
    /** Restrict to one author — used by the profile page. */
    authorId?: string;
    /** Fetch exactly one post — used to resolve a shared ?post= link. */
    postId?: string;
}

/**
 * Returns the shared feed, newest first, shaped as the `Post` view model the
 * existing UI already renders. Author details, reaction tallies and comments
 * are joined in, along with the caller's own reaction so the UI can highlight it.
 */
export async function fetchFeed(
    options: FetchFeedOptions = {}
): Promise<{ data: Post[]; hasMore: boolean; error?: string }> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        const admin = createSupabaseAdminClient();

        // One extra row tells us whether another page exists, without a
        // separate count query.
        const selectPosts = (columns: string) => {
            let query = admin
                .from('community_posts')
                .select(columns)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit);

            if (options.authorId) query = query.eq('user_id', options.authorId);
            if (options.postId) query = query.eq('id', options.postId);
            return query;
        };

        let { data: postRows, error } = await selectPosts(POST_COLUMNS);

        // If the code ships ahead of migration 028, fall back to the columns
        // that do exist rather than blanking the whole feed. Polls simply do
        // not render until the migration runs.
        if (error?.code === UNDEFINED_COLUMN) {
            console.warn('[fetchFeed] poll_options missing — run migration 028. Serving the feed without polls.');
            ({ data: postRows, error } = await selectPosts(POST_COLUMNS_LEGACY));
        }

        if (error) {
            console.error('[fetchFeed] posts error:', error);
            return { data: [], hasMore: false, error: error.message };
        }

        // The column list is chosen at runtime (see the 028 fallback above), so
        // supabase-js cannot infer the row shape here.
        const allRows = (postRows ?? []) as unknown as PostRow[];
        const hasMore = allRows.length > limit;
        const posts = hasMore ? allRows.slice(0, limit) : allRows;
        if (posts.length === 0) return { data: [], hasMore: false };

        const postIds = posts.map(p => p.id);

        // Authors, reactions, comments, share counts and poll votes in batched
        // queries rather than one round trip per post.
        const [authorsRes, reactionsRes, commentsRes, sharesRes, pollVotesRes] = await Promise.all([
            admin.from('profiles')
                .select('id, full_name, username, avatar_url, farm_location, role')
                .in('id', [...new Set(posts.map(p => p.user_id))]),
            admin.from('community_reactions')
                .select('post_id, user_id, type')
                .in('post_id', postIds),
            admin.from('community_comments')
                .select('id, post_id, user_id, parent_id, text, created_at')
                .in('post_id', postIds)
                .order('created_at', { ascending: true }),
            admin.from('community_shares')
                .select('post_id')
                .in('post_id', postIds),
            admin.from('community_poll_votes')
                .select('post_id, user_id, option_index')
                .in('post_id', postIds),
        ]);

        // Poll tallies, plus which option the caller picked.
        const pollTallies = new Map<string, Map<number, number>>();
        const myPollVote = new Map<string, number>();
        for (const v of (pollVotesRes.data ?? []) as { post_id: string; user_id: string; option_index: number }[]) {
            const counts = pollTallies.get(v.post_id) ?? new Map<number, number>();
            counts.set(v.option_index, (counts.get(v.option_index) ?? 0) + 1);
            pollTallies.set(v.post_id, counts);
            if (user && v.user_id === user.id) myPollVote.set(v.post_id, v.option_index);
        }

        const buildPoll = (row: PostRow): Poll | undefined => {
            const options = (row.poll_options ?? []).filter(Boolean);
            if (options.length === 0) return undefined;
            const counts = pollTallies.get(row.id) ?? new Map<number, number>();
            const built = options.map((text, index) => ({
                index,
                text,
                votes: counts.get(index) ?? 0,
            }));
            return {
                options: built,
                totalVotes: built.reduce((sum, o) => sum + o.votes, 0),
                myVote: myPollVote.get(row.id) ?? null,
            };
        };

        const shareCounts = new Map<string, number>();
        for (const s of (sharesRes.data ?? []) as { post_id: string }[]) {
            shareCounts.set(s.post_id, (shareCounts.get(s.post_id) ?? 0) + 1);
        }

        const authorById = new Map<string, AuthorRow>();
        for (const a of (authorsRes.data ?? []) as AuthorRow[]) authorById.set(a.id, a);

        // Comment authors may not be post authors — fetch any that are missing.
        const commentRows = (commentsRes.data ?? []) as {
            id: string; post_id: string; user_id: string; parent_id: string | null; text: string; created_at: string;
        }[];
        const missingAuthorIds = [...new Set(commentRows.map(c => c.user_id))].filter(id => !authorById.has(id));
        if (missingAuthorIds.length > 0) {
            const { data: extra } = await admin.from('profiles')
                .select('id, full_name, username, avatar_url, farm_location, role')
                .in('id', missingAuthorIds);
            for (const a of (extra ?? []) as AuthorRow[]) authorById.set(a.id, a);
        }

        const reactionRows = (reactionsRes.data ?? []) as { post_id: string; user_id: string; type: string }[];

        const tallies = new Map<string, Record<ReactionType, number>>();
        const myReaction = new Map<string, ReactionType>();
        for (const r of reactionRows) {
            const current = tallies.get(r.post_id) ?? { ...EMPTY_REACTIONS };
            const type = (r.type in EMPTY_REACTIONS ? r.type : 'like') as ReactionType;
            current[type] += 1;
            tallies.set(r.post_id, current);
            if (user && r.user_id === user.id) myReaction.set(r.post_id, type);
        }

        // Comment likes — tallies plus whether the caller liked each one.
        const commentLikeCounts = new Map<string, number>();
        const likedByMe = new Set<string>();
        if (commentRows.length > 0) {
            const { data: likeRows } = await admin
                .from('community_comment_likes')
                .select('comment_id, user_id')
                .in('comment_id', commentRows.map(c => c.id));
            for (const l of (likeRows ?? []) as { comment_id: string; user_id: string }[]) {
                commentLikeCounts.set(l.comment_id, (commentLikeCounts.get(l.comment_id) ?? 0) + 1);
                if (user && l.user_id === user.id) likedByMe.add(l.comment_id);
            }
        }

        // Build comment trees, one level of replies.
        const commentsByPost = new Map<string, Comment[]>();
        const commentById = new Map<string, Comment>();
        for (const row of commentRows) {
            const author = authorById.get(row.user_id);
            const comment: Comment = {
                id: row.id,
                author: displayName(author),
                avatar: author?.avatar_url || '',
                text: row.text,
                time: relativeTime(row.created_at),
                likes: commentLikeCounts.get(row.id) ?? 0,
                liked: likedByMe.has(row.id),
                replies: [],
            };
            commentById.set(row.id, comment);
            if (row.parent_id && commentById.has(row.parent_id)) {
                commentById.get(row.parent_id)!.replies!.push(comment);
            } else {
                const list = commentsByPost.get(row.post_id) ?? [];
                list.push(comment);
                commentsByPost.set(row.post_id, list);
            }
        }

        const countAll = (list: Comment[]): number =>
            list.reduce((sum, c) => sum + 1 + countAll(c.replies ?? []), 0);

        const data: Post[] = posts.map(row => {
            const author = authorById.get(row.user_id);
            const reactions = tallies.get(row.id) ?? { ...EMPTY_REACTIONS };
            const comments = commentsByPost.get(row.id) ?? [];
            const images = (row.images ?? []).filter(Boolean);
            const poll = buildPoll(row);

            return {
                id: row.id,
                author: displayName(author),
                username: handleFor(author, row.user_id),
                avatar: author?.avatar_url || '',
                verified: author?.role === 'service_provider' || author?.role === 'dealer',
                location: row.location || author?.farm_location || '',
                time: relativeTime(row.created_at),
                content: row.content,
                images: images.length > 0 ? images : undefined,
                video: row.video || undefined,
                poll,
                reactions,
                myReaction: myReaction.get(row.id) ?? null,
                totalReactions: Object.values(reactions).reduce((a, b) => a + b, 0),
                comments,
                commentCount: countAll(comments),
                shares: shareCounts.get(row.id) ?? 0,
                saved: false,
                tags: row.tags ?? [],
                type: poll ? 'poll' : row.video ? 'video' : images.length > 0 ? 'image' : 'post',
                isOwn: !!user && user.id === row.user_id,
            };
        });

        return { data, hasMore };
    } catch (err) {
        console.error('[fetchFeed] unexpected:', err);
        return { data: [], hasMore: false, error: 'Failed to load the feed' };
    }
}

// ─── Create / edit / delete ──────────────────────────────────────────

export interface CreatePostInput {
    content: string;
    images?: string[];
    video?: string | null;
    location?: string;
    tags?: string[];
    /** 2–4 choices. Stored on the post row, so publishing stays one atomic insert. */
    pollOptions?: string[];
}

/**
 * Publishes a post. Text, media, tags, location and poll options all land in a
 * single INSERT, so a post can never appear without the poll it was created
 * with — there is no half-published state to clean up.
 *
 * Media must already be a public storage URL. Data URLs are rejected rather
 * than stored: a base64 video blows past the 1 MB Server Action body cap (the
 * request never even arrives), and a base64 image would bloat every feed query
 * that reads the row.
 */
export async function createPost(input: CreatePostInput): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to post' };

        const content = (input.content ?? '').trim();
        const images = (input.images ?? []).filter(Boolean);
        const video = input.video || null;

        // Poll options: trimmed, de-duplicated, capped at the 4 the composer allows.
        const pollOptions = [...new Set(
            (input.pollOptions ?? []).map(o => o.trim()).filter(Boolean)
        )].slice(0, 4);

        if (!content && images.length === 0 && !video && pollOptions.length === 0) {
            return { success: false, error: 'Write something or add a photo' };
        }
        if (pollOptions.length === 1) {
            return { success: false, error: 'A poll needs at least two options' };
        }

        const isStoredUrl = (value: string) => /^https?:\/\//i.test(value);
        if (images.some(i => !isStoredUrl(i)) || (video && !isStoredUrl(video))) {
            return { success: false, error: 'Media is still uploading. Please wait a moment and try again.' };
        }

        // Hashtags typed in the body become tags, on top of any passed explicitly.
        const inlineTags = Array.from(content.matchAll(/#(\w+)/g)).map(m => m[1].toLowerCase());
        const tags = [...new Set([...(input.tags ?? []).map(t => t.toLowerCase()), ...inlineTags])];

        const { data, error } = await createSupabaseAdminClient()
            .from('community_posts')
            .insert({
                user_id: user.id,
                content,
                images,
                video,
                location: input.location?.trim() || null,
                tags,
                poll_options: pollOptions,
            })
            .select('id')
            .single();

        if (error) {
            console.error('[createPost] error:', error);
            return { success: false, error: error.message };
        }
        return { success: true, id: data?.id };
    } catch (err) {
        console.error('[createPost] unexpected:', err);
        return { success: false, error: 'Could not publish your post' };
    }
}

// ─── Poll votes ──────────────────────────────────────────────────────

/**
 * Casts, changes or clears the caller's vote. Voting for the option you already
 * picked withdraws it, matching how reactions behave.
 */
export async function votePoll(
    postId: string,
    optionIndex: number
): Promise<{ success: boolean; myVote?: number | null; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to vote' };

        const admin = createSupabaseAdminClient();

        // The option has to exist on the post — an index from a stale feed must
        // not create a vote for a choice that was never there.
        const { data: post } = await admin
            .from('community_posts')
            .select('poll_options')
            .eq('id', postId)
            .maybeSingle();

        const options = (post?.poll_options ?? []) as string[];
        if (options.length === 0) return { success: false, error: 'This post has no poll' };
        if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
            return { success: false, error: 'That option no longer exists' };
        }

        const { data: existing } = await admin
            .from('community_poll_votes')
            .select('id, option_index')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existing?.option_index === optionIndex) {
            const { error } = await admin.from('community_poll_votes').delete().eq('id', existing.id);
            if (error) return { success: false, error: error.message };
            return { success: true, myVote: null };
        }

        const { error } = await admin
            .from('community_poll_votes')
            .upsert(
                { post_id: postId, user_id: user.id, option_index: optionIndex },
                { onConflict: 'post_id,user_id' }
            );

        if (error) return { success: false, error: error.message };
        return { success: true, myVote: optionIndex };
    } catch {
        return { success: false, error: 'Could not save your vote' };
    }
}

// ─── Stories ─────────────────────────────────────────────────────────

interface StoryRow {
    id: string;
    user_id: string;
    image: string;
    created_at: string;
}

/**
 * Publishes one or more stories in a single batch insert, so a multi-photo
 * story is all-or-nothing rather than partially posted.
 *
 * Images must already be uploaded — a data URL here would be stored verbatim
 * and served to every viewer as a multi-megabyte string.
 */
export async function createStories(images: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to post a story' };

        const clean = (images ?? []).map(i => i.trim()).filter(Boolean);
        if (clean.length === 0) return { success: false, error: 'Choose at least one image' };
        if (clean.some(i => !/^https?:\/\//i.test(i))) {
            return { success: false, error: 'Images are still uploading. Please wait a moment and try again.' };
        }

        const { error } = await createSupabaseAdminClient()
            .from('community_stories')
            .insert(clean.map(image => ({ user_id: user.id, image })));

        if (error) {
            console.error('[createStories] error:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err) {
        console.error('[createStories] unexpected:', err);
        return { success: false, error: 'Could not post your story' };
    }
}

/**
 * Live stories (posted in the last 24 hours), the caller's own first so their
 * ring sits at the head of the bar.
 */
export async function fetchStories(): Promise<{ data: Story[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        const admin = createSupabaseAdminClient();

        const { data: rows, error } = await admin
            .from('community_stories')
            .select('id, user_id, image, created_at')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: true })
            .limit(200);

        if (error) {
            console.error('[fetchStories] error:', error);
            return { data: [], error: error.message };
        }

        const storyRows = (rows ?? []) as StoryRow[];
        if (storyRows.length === 0) return { data: [] };

        const myStoryIds = user ? storyRows.filter(r => r.user_id === user.id).map(r => r.id) : [];

        const [authorsRes, viewsRes, myViewsRes] = await Promise.all([
            admin.from('profiles')
                .select('id, full_name, username, avatar_url, farm_location, role')
                .in('id', [...new Set(storyRows.map(r => r.user_id))]),
            user
                ? admin.from('community_story_views')
                    .select('story_id')
                    .eq('user_id', user.id)
                    .in('story_id', storyRows.map(r => r.id))
                : Promise.resolve({ data: [] as { story_id: string }[] }),
            // View tallies for the caller's own stories — the "seen by N" badge.
            myStoryIds.length > 0
                ? admin.from('community_story_views').select('story_id').in('story_id', myStoryIds)
                : Promise.resolve({ data: [] as { story_id: string }[] }),
        ]);

        const authorById = new Map<string, AuthorRow>();
        for (const a of (authorsRes.data ?? []) as AuthorRow[]) authorById.set(a.id, a);

        const seen = new Set(((viewsRes.data ?? []) as { story_id: string }[]).map(v => v.story_id));

        const viewCounts = new Map<string, number>();
        for (const v of (myViewsRes.data ?? []) as { story_id: string }[]) {
            viewCounts.set(v.story_id, (viewCounts.get(v.story_id) ?? 0) + 1);
        }

        const data: Story[] = storyRows.map(row => {
            const author = authorById.get(row.user_id);
            const isOwn = !!user && user.id === row.user_id;
            return {
                id: row.id,
                author: isOwn ? 'Your Story' : displayName(author),
                username: handleFor(author, row.user_id),
                avatar: author?.avatar_url || '',
                image: row.image,
                seen: seen.has(row.id),
                isOwn,
                ...(isOwn ? { viewCount: viewCounts.get(row.id) ?? 0 } : {}),
            };
        });

        // Own stories first, everyone else in the order they were posted.
        return { data: [...data.filter(s => s.isOwn), ...data.filter(s => !s.isOwn)] };
    } catch (err) {
        console.error('[fetchStories] unexpected:', err);
        return { data: [], error: 'Failed to load stories' };
    }
}

/**
 * Records that the caller watched a story, so the ring stays grey on every
 * device. One upsert — watching the same story twice cannot double-count, and
 * two devices racing on the same story settle on one row.
 *
 * Viewing your own story is not a view: it is skipped here and, for older
 * clients, by the trigger added in 029.
 */
export async function markStorySeen(storyId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const admin = createSupabaseAdminClient();
        const { data: story } = await admin
            .from('community_stories')
            .select('user_id')
            .eq('id', storyId)
            .maybeSingle();

        if (!story) return { success: false, error: 'That story is no longer available' };
        if (story.user_id === user.id) return { success: true }; // your own story

        const { error } = await admin
            .from('community_story_views')
            .upsert({ story_id: storyId, user_id: user.id }, { onConflict: 'story_id,user_id' });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not record the view' };
    }
}

export interface StoryViewer {
    id: string;
    name: string;
    username: string;
    avatar: string;
    /** Relative time the story was watched. */
    time: string;
}

/**
 * Who has watched a story. Only the author may ask — a viewer list is private
 * to whoever posted it, exactly as on Instagram.
 */
export async function fetchStoryViewers(
    storyId: string
): Promise<{ data: StoryViewer[]; total: number; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], total: 0, error: 'Please sign in' };

        const admin = createSupabaseAdminClient();
        const { data: story } = await admin
            .from('community_stories')
            .select('user_id')
            .eq('id', storyId)
            .maybeSingle();

        if (!story) return { data: [], total: 0, error: 'That story is no longer available' };
        if (story.user_id !== user.id) {
            return { data: [], total: 0, error: 'Only the author can see who viewed a story' };
        }

        const { data: views, error } = await admin
            .from('community_story_views')
            .select('user_id, created_at')
            .eq('story_id', storyId)
            .order('created_at', { ascending: false });

        if (error) return { data: [], total: 0, error: error.message };

        const rows = (views ?? []) as { user_id: string; created_at: string }[];
        if (rows.length === 0) return { data: [], total: 0 };

        const { data: profiles } = await admin
            .from('profiles')
            .select('id, full_name, username, avatar_url, farm_location, role')
            .in('id', rows.map(r => r.user_id));

        const authorById = new Map<string, AuthorRow>();
        for (const a of (profiles ?? []) as AuthorRow[]) authorById.set(a.id, a);

        return {
            data: rows.map(row => {
                const author = authorById.get(row.user_id);
                return {
                    id: row.user_id,
                    name: displayName(author),
                    username: handleFor(author, row.user_id),
                    avatar: author?.avatar_url || '',
                    time: relativeTime(row.created_at),
                };
            }),
            total: rows.length,
        };
    } catch (err) {
        console.error('[fetchStoryViewers] unexpected:', err);
        return { data: [], total: 0, error: 'Failed to load viewers' };
    }
}

/**
 * Swaps the image on one of the caller's own stories, keeping its id, its
 * place in the ring and its 24-hour clock. One UPDATE, so viewers never see a
 * story that has lost its image.
 */
export async function updateStory(
    storyId: string,
    image: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const clean = image.trim();
        if (!/^https?:\/\//i.test(clean)) {
            return { success: false, error: 'Image is still uploading. Please wait a moment and try again.' };
        }

        const { data, error } = await createSupabaseAdminClient()
            .from('community_stories')
            .update({ image: clean })
            .eq('id', storyId)
            .eq('user_id', user.id) // ownership enforced server-side
            .select('id');

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) return { success: false, error: 'That story is not yours to edit' };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not update the story' };
    }
}

/**
 * Deletes one of the caller's own stories. Views cascade with it, so no
 * orphaned view rows survive.
 */
export async function deleteStory(storyId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const { data, error } = await createSupabaseAdminClient()
            .from('community_stories')
            .delete()
            .eq('id', storyId)
            .eq('user_id', user.id) // ownership enforced server-side
            .select('id');

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) return { success: false, error: 'That story is not yours to delete' };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not delete the story' };
    }
}

export interface UpdatePostInput {
    content: string;
    images?: string[];
    video?: string | null;
    tags?: string[];
}

/**
 * Edits a post the caller owns. Media and tags are persisted alongside the
 * text — previously only `content` was written, so removing a photo in the
 * editor looked like it worked until the next refresh brought it back.
 */
export async function updatePost(
    postId: string,
    input: string | UpdatePostInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const patch = typeof input === 'string' ? { content: input } : input;
        const content = (patch.content ?? '').trim();

        const fields: Record<string, unknown> = {
            content,
            updated_at: new Date().toISOString(),
        };

        if (patch.images !== undefined) {
            const images = patch.images.filter(Boolean);
            if (images.some(i => !/^https?:\/\//i.test(i))) {
                return { success: false, error: 'Media is still uploading. Please wait a moment and try again.' };
            }
            fields.images = images;
        }
        if (patch.video !== undefined) {
            if (patch.video && !/^https?:\/\//i.test(patch.video)) {
                return { success: false, error: 'Media is still uploading. Please wait a moment and try again.' };
            }
            fields.video = patch.video || null;
        }
        if (patch.tags !== undefined) {
            const inlineTags = Array.from(content.matchAll(/#(\w+)/g)).map(m => m[1].toLowerCase());
            fields.tags = [...new Set([...patch.tags.map(t => t.toLowerCase()), ...inlineTags])];
        }

        const { error } = await createSupabaseAdminClient()
            .from('community_posts')
            .update(fields)
            .eq('id', postId)
            .eq('user_id', user.id); // ownership enforced server-side

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not update the post' };
    }
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const { error } = await createSupabaseAdminClient()
            .from('community_posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not delete the post' };
    }
}

// ─── Reactions ───────────────────────────────────────────────────────

/** Tapping the same reaction removes it; a different one replaces it. */
export async function toggleReaction(postId: string, type: ReactionType): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to react' };

        const admin = createSupabaseAdminClient();
        const { data: existing } = await admin
            .from('community_reactions')
            .select('id, type')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existing?.type === type) {
            const { error } = await admin.from('community_reactions').delete().eq('id', existing.id);
            if (error) return { success: false, error: error.message };
            return { success: true };
        }

        const { error } = await admin
            .from('community_reactions')
            .upsert({ post_id: postId, user_id: user.id, type }, { onConflict: 'post_id,user_id' });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not save your reaction' };
    }
}

// ─── Comments ────────────────────────────────────────────────────────

export async function addComment(
    postId: string,
    text: string,
    parentId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to comment' };

        const clean = text.trim();
        if (!clean) return { success: false, error: 'Comment cannot be empty' };

        const { error } = await createSupabaseAdminClient()
            .from('community_comments')
            .insert({ post_id: postId, user_id: user.id, parent_id: parentId || null, text: clean });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not post your comment' };
    }
}

// ─── Comment likes ───────────────────────────────────────────────────

/** Toggles the caller's like on a comment. Persisted, so it follows them. */
export async function toggleCommentLike(commentId: string): Promise<{ success: boolean; liked?: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to like' };

        const admin = createSupabaseAdminClient();
        const { data: existing } = await admin
            .from('community_comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existing) {
            const { error } = await admin.from('community_comment_likes').delete().eq('id', existing.id);
            if (error) return { success: false, error: error.message };
            return { success: true, liked: false };
        }

        const { error } = await admin
            .from('community_comment_likes')
            .insert({ comment_id: commentId, user_id: user.id });
        if (error) return { success: false, error: error.message };
        return { success: true, liked: true };
    } catch {
        return { success: false, error: 'Could not save your like' };
    }
}

// ─── Shares ──────────────────────────────────────────────────────────

/** Records a share event. Every share counts — sharing twice counts twice. */
export async function recordShare(postId: string, channel = 'native'): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const { error } = await createSupabaseAdminClient()
            .from('community_shares')
            .insert({ post_id: postId, user_id: user.id, channel });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not record the share' };
    }
}

// ─── Follows ─────────────────────────────────────────────────────────

/** Resolves a public handle (or raw id) to a user id. */
async function resolveUserId(handleOrId: string): Promise<string | null> {
    const clean = handleOrId.trim().replace(/^@/, '');
    if (!clean) return null;

    const admin = createSupabaseAdminClient();
    if (/^[0-9a-f-]{36}$/i.test(clean)) return clean;

    const { data } = await admin
        .from('profiles')
        .select('id')
        .ilike('username', clean)
        .limit(1)
        .maybeSingle();
    return data?.id ?? null;
}

/**
 * The caller's own public handle.
 *
 * Links to "my profile" used to be built as `normalizeUsername(displayName)`,
 * falling back to the literal word "you" — a handle no profile row has, so the
 * page loaded empty. This returns the real `profiles.username`, matching what
 * `handleFor` puts on every post.
 */
export async function fetchMyCommunityHandle(): Promise<{ username: string | null }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { username: null };

        const { data } = await createSupabaseAdminClient()
            .from('profiles')
            .select('id, full_name, username, avatar_url, farm_location, role')
            .eq('id', user.id)
            .maybeSingle();

        return { username: handleFor((data ?? undefined) as AuthorRow | undefined, user.id) };
    } catch {
        return { username: null };
    }
}

/** Handles the caller follows — the source of truth for every device. */
export async function fetchFollowing(): Promise<{ data: string[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [] };

        const admin = createSupabaseAdminClient();
        const { data: rows, error } = await admin
            .from('community_follows')
            .select('following_id')
            .eq('follower_id', user.id);

        if (error) return { data: [], error: error.message };
        const ids = (rows ?? []).map(r => r.following_id as string);
        if (ids.length === 0) return { data: [] };

        const { data: profiles } = await admin
            .from('profiles')
            .select('id, username')
            .in('id', ids);

        return {
            data: ((profiles ?? []) as { id: string; username: string | null }[])
                .map(p => p.username || `farmer_${p.id.replace(/-/g, '').slice(0, 6)}`),
        };
    } catch {
        return { data: [], error: 'Failed to load your following list' };
    }
}

/** Follows or unfollows someone by handle. Returns the resulting state. */
export async function toggleFollow(handle: string): Promise<{ success: boolean; following?: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to follow' };

        const targetId = await resolveUserId(handle);
        if (!targetId) return { success: false, error: 'That profile no longer exists' };
        if (targetId === user.id) return { success: false, error: 'You cannot follow yourself' };

        const admin = createSupabaseAdminClient();
        const { data: existing } = await admin
            .from('community_follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', targetId)
            .maybeSingle();

        if (existing) {
            const { error } = await admin.from('community_follows').delete().eq('id', existing.id);
            if (error) return { success: false, error: error.message };
            return { success: true, following: false };
        }

        const { error } = await admin
            .from('community_follows')
            .insert({ follower_id: user.id, following_id: targetId });
        if (error) return { success: false, error: error.message };
        return { success: true, following: true };
    } catch {
        return { success: false, error: 'Could not update follow' };
    }
}

/** Follower/following tallies for a profile, plus whether the caller follows it. */
export async function fetchFollowStats(handle: string): Promise<{
    followers: number;
    following: number;
    isFollowing: boolean;
}> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        const targetId = await resolveUserId(handle);
        if (!targetId) return { followers: 0, following: 0, isFollowing: false };

        const admin = createSupabaseAdminClient();
        const [followers, following, mine] = await Promise.all([
            admin.from('community_follows').select('id', { count: 'exact', head: true }).eq('following_id', targetId),
            admin.from('community_follows').select('id', { count: 'exact', head: true }).eq('follower_id', targetId),
            user
                ? admin.from('community_follows').select('id').eq('follower_id', user.id).eq('following_id', targetId).maybeSingle()
                : Promise.resolve({ data: null }),
        ]);

        return {
            followers: followers.count ?? 0,
            following: following.count ?? 0,
            isFollowing: !!(mine as { data: unknown }).data,
        };
    } catch {
        return { followers: 0, following: 0, isFollowing: false };
    }
}

// ─── People ──────────────────────────────────────────────────────────

/**
 * Everyone who has created a profile, newest first. `query` filters by name or
 * handle. The caller is excluded so the directory shows other farmers.
 */
export async function fetchCommunityUsers(query = '', limit = 30): Promise<{ data: CommunityUser[]; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        const admin = createSupabaseAdminClient();

        let request = admin
            .from('profiles')
            .select('id, full_name, username, avatar_url, farm_location, role')
            .order('created_at', { ascending: false })
            .limit(limit);

        const term = query.trim().replace(/^@/, '');
        if (term) request = request.or(`full_name.ilike.%${term}%,username.ilike.%${term}%`);

        const { data, error } = await request;
        if (error) {
            console.error('[fetchCommunityUsers] error:', error);
            return { data: [], error: error.message };
        }

        const rows = ((data ?? []) as AuthorRow[]).filter(r => !user || r.id !== user.id);
        if (rows.length === 0) return { data: [] };

        const ids = rows.map(r => r.id);

        // Post counts, follower counts and who the caller already follows.
        const [postRes, followerRes, mineRes] = await Promise.all([
            admin.from('community_posts').select('user_id').in('user_id', ids),
            admin.from('community_follows').select('following_id').in('following_id', ids),
            user
                ? admin.from('community_follows').select('following_id').eq('follower_id', user.id)
                : Promise.resolve({ data: [] as { following_id: string }[] }),
        ]);

        const counts = new Map<string, number>();
        for (const p of (postRes.data ?? []) as { user_id: string }[]) {
            counts.set(p.user_id, (counts.get(p.user_id) ?? 0) + 1);
        }

        const followerCounts = new Map<string, number>();
        for (const f of (followerRes.data ?? []) as { following_id: string }[]) {
            followerCounts.set(f.following_id, (followerCounts.get(f.following_id) ?? 0) + 1);
        }

        const iFollow = new Set(
            ((mineRes.data ?? []) as { following_id: string }[]).map(f => f.following_id)
        );

        return {
            data: rows.map(r => ({
                id: r.id,
                name: displayName(r),
                username: handleFor(r, r.id),
                avatar: r.avatar_url || '',
                bio: r.role === 'service_provider' ? 'Service Provider' : r.role === 'dealer' ? 'Dealer' : 'Farmer',
                location: r.farm_location || '',
                role: r.role || 'farmer',
                postCount: counts.get(r.id) ?? 0,
                followerCount: followerCounts.get(r.id) ?? 0,
                isFollowing: iFollow.has(r.id),
            })),
        };
    } catch (err) {
        console.error('[fetchCommunityUsers] unexpected:', err);
        return { data: [], error: 'Failed to load people' };
    }
}

/** A single profile plus that person's posts, for /home/community/user/[username]. */
export async function fetchUserProfileByHandle(
    handle: string
): Promise<{ user: CommunityUser | null; posts: Post[]; error?: string }> {
    try {
        const admin = createSupabaseAdminClient();
        const clean = handle.trim().replace(/^@/, '');

        // Match the handle, or the raw id if the route was given one.
        const { data, error } = await admin
            .from('profiles')
            .select('id, full_name, username, avatar_url, farm_location, role')
            .or(`username.ilike.${clean},id.eq.${/^[0-9a-f-]{36}$/i.test(clean) ? clean : '00000000-0000-0000-0000-000000000000'}`)
            .limit(1)
            .maybeSingle();

        if (error || !data) return { user: null, posts: [], error: error?.message };

        const row = data as AuthorRow;
        const { data: posts } = await fetchFeed({ authorId: row.id, limit: 50 });

        return {
            user: {
                id: row.id,
                name: displayName(row),
                username: handleFor(row, row.id),
                avatar: row.avatar_url || '',
                bio: row.role === 'service_provider' ? 'Service Provider' : row.role === 'dealer' ? 'Dealer' : 'Farmer',
                location: row.farm_location || '',
                role: row.role || 'farmer',
                postCount: posts.length,
            },
            posts,
        };
    } catch (err) {
        console.error('[fetchUserProfileByHandle] unexpected:', err);
        return { user: null, posts: [], error: 'Failed to load this profile' };
    }
}
