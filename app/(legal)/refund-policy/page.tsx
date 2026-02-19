import { PolicyContent } from "@/components/legal/PolicyContent";

export default function RefundPolicy() {
    return (
        <PolicyContent title="Refund Policy">
            <section className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Overview</h3>
                    <p className="text-muted-foreground">
                        Our policy allows for refunds under specific conditions. If you are not completely satisfied with your purchase, we are here to help.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Conditions for Returns</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Due to the perishable nature of food, we generally do not accept returns.</li>
                        <li>However, if you receive a wrong item, a damaged item, or if an item is missing, you are eligible for a refund.</li>
                        <li>Issues must be reported within 1 hour of delivery with photographic evidence if applicable.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Refunds</h3>
                    <p className="text-muted-foreground">
                        Once we receive your complaint and inspect the evidence (if required), we will notify you of the approval or rejection of your refund.
                        If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within 5-7 business days.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Late or Missing Refunds</h3>
                    <p className="text-muted-foreground">
                        If you haven’t received a refund yet, first check your bank account again.
                        Then contact your credit card company, it may take some time before your refund is officially posted.
                        If you’ve done all of this and you still have not received your refund yet, please contact us at support@biryanifactory.com.
                    </p>
                </div>
            </section>
        </PolicyContent>
    );
}
