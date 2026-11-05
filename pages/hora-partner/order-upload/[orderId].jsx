import { useRouter } from "next/router";
import { useEffect } from "react";
import ImageUpload from "../../../component/ImageUpload";

const OrderUpload = () => {
    const router = useRouter();

    const { orderId, id } = router.query;

    useEffect(() => {

        const supplierID = localStorage.getItem("supplierID");

        if (!supplierID) {
            router.replace("/hora-partner/login");
        }
    }, [router.isReady]);

    return (
        <div>
            <ImageUpload orderId={orderId} customerId={id} />
        </div>
    );
};

export default OrderUpload;