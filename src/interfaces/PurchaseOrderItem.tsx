interface PurchaseOrderItem {
  id: string;
  projectId: string;
  code: string;
  date: string;
  amountUSD: number;
  amountCOL: number;
}

export default PurchaseOrderItem;
