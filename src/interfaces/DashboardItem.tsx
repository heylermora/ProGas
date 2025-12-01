interface ExpenseSummary {
    month: number;
    amountCOL: number;
    amountUSD: number;
}
  
interface InvoiceSummary {
    month: number;
    amountCOL: number;
    amountUSD: number;
}

interface DashboardViewItem {
    id: string;
    name: string;
    client: string;
    requestDate: string;
    type: string;
    squareMeters: number;
    budgetUSD: number;
    budgetCOL: number;
    expenseId: string;
    expenseDate: string;
    discriminator: string;
    expenseAmountCOL: number;
    expenseAmountUSD: number;
    invoiceAmountCOL: number;
    invoiceAmountUSD: number;
    purchaseOrderAmountCOL: number;
    purchaseOrderAmountUSD: number;
    invoiceList: InvoiceSummary;
    expenseList:ExpenseSummary;
}

export default DashboardViewItem;