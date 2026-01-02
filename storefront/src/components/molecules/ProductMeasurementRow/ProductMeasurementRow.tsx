import { SingleProductMeasurement } from '@/types/product';

/**
 * ProductMeasurementRow - Displays product dimensions in a row format
 * 
 * Note: This component was renamed from ProdutMeasurementRow (typo fix)
 */
export const ProductMeasurementRow = ({
  measurement,
}: {
  measurement: SingleProductMeasurement;
}) => {
  const { label, inches, cm } = measurement;
  return (
    <div className='border rounded-sm grid grid-cols-3 text-center label-md'>
      <div className='border-r py-3'>{label}</div>
      <div className='border-r py-3'>{inches} in</div>
      <div className='py-3'>{cm} cm</div>
    </div>
  );
};

// Backward compatibility alias (deprecated - will be removed in future version)
/** @deprecated Use ProductMeasurementRow instead */
export const ProdutMeasurementRow = ProductMeasurementRow;
