
export interface VerificationResult {
  vehiclePlateVisible: boolean;
  goodsBeingUnloaded: boolean;
  vehicleFullyLoaded: boolean;
  vehicleEmpty: boolean;
  receiptMemoPresent: boolean;
  invoicePresent: boolean;
  summary: string;
}

export interface ImageFile {
  file: File;
  preview: string;
}
