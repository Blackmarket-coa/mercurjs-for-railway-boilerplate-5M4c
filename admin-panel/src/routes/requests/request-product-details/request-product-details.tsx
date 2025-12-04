import { useParams } from "react-router-dom";

import { ProductRequestDetail } from "@routes/requests/request-product-details/components/product-detail";

export const RequestProductDetails = () => {
  const { id } = useParams();

  return <ProductRequestDetail id={id!} />;
};
