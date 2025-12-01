interface ReceiptItem {
    id: string;
    invoiceId: string;
    code: string;
    date: string;
    amountUSD: number;
    amountCOL: number;
}
 
export default ReceiptItem;