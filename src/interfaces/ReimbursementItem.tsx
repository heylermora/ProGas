interface ReimbursementItem {
    id: string;
    projectId: string;
    date: string;
    amountUSD: number;
    amountCOL: number;
    consecutive: string;
}
 
export default ReimbursementItem;