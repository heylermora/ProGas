interface InvoiceItem {
    id: string;
    purchaseOrderId: string;
    code: string;
    date: string;
    amountUSD: number;
    amountCOL: number;
    vatUSD: number;
    vatCOL: number;
}
 
export default InvoiceItem;