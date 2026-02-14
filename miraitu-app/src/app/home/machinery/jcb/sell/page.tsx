import SellMachineryForm from '@/components/v2/machinery/SellMachineryForm';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

export default function SellJCBPage() {
    return (
        <div className="px-6 py-8">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="jcb" currentAction="sell" />
                <SellMachineryForm category="jcb" />
            </div>
        </div>
    );
}

