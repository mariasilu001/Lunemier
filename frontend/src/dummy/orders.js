export const mockOrders = [
    {
        _id: 1,
        user_id: 2,
        status: "paid",
        pickup_point_id: 1,
        payment_method_id: 1,
        total_amount: 9980.0,
        created_at: "2026-05-30T16:00:00Z",
        updated_at: "2026-05-30T16:05:00Z",
        is_hidden: false,
        order_items: [
            {
                product_id: 1,
                quantity: 2,
                price_snapshot: 4990.0,
            },
        ],
    },
];
