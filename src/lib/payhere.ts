import crypto from 'crypto';

/**
 * Generates the PayHere hash for secure checkout.
 * Format: UpperCase(MD5(MerchantID + OrderID + Amount + Currency + UpperCase(MD5(MerchantSecret))))
 */
export function generatePayHereHash(
    merchantId: string,
    orderId: string,
    amount: number,
    currency: string,
    merchantSecret: string
) {
    const hashedSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // Amount must be formatted to 2 decimal places
    const formattedAmount = amount.toFixed(2);

    const mainString = merchantId + orderId + formattedAmount + currency + hashedSecret;

    return crypto
        .createHash('md5')
        .update(mainString)
        .digest('hex')
        .toUpperCase();
}

export const payhereConfig = {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
    isSandbox: process.env.PAYHERE_MODE === 'sandbox',
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/orders`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/orders`,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payhere/notify`,
};
