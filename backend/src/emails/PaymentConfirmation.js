const React = require('react');
const { Html, Head, Body, Container, Section, Text, Hr, Img, Row, Column, Button } = require('@react-email/components');

const PaymentConfirmation = ({ orderDetails }) => {
    const { orderId, customerName, customerEmail, total, items, address, createdAt } = orderDetails;

    return React.createElement(Html, null,
        React.createElement(Head, null),
        React.createElement(Body, { style: main },
            React.createElement(Container, { style: container },
                React.createElement(Section, { style: header },
                    React.createElement(Text, { style: title }, '✅ Payment Success!')
                ),
                React.createElement(Section, { style: content },
                    React.createElement(Text, { style: greeting }, `Hello ${customerName},`),
                    React.createElement(Text, { style: paragraph },
                        'Thank you for your order! Your payment has been successfully confirmed.'
                    ),
                    React.createElement(Hr, { style: hr }),
                    React.createElement(Text, { style: sectionTitle }, 'Order Details'),
                    React.createElement(Row, { style: infoRow },
                        React.createElement(Column, null,
                            React.createElement(Text, { style: label }, 'Order Number:'),
                            React.createElement(Text, { style: value }, `#${orderId}`)
                        ),
                        React.createElement(Column, null,
                            React.createElement(Text, { style: label }, 'Order Date:'),
                            React.createElement(Text, { style: value }, new Date(createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }))
                        )
                    ),
                    React.createElement(Text, { style: label }, 'Shipping Address:'),
                    React.createElement(Text, { style: addressText }, address),
                    React.createElement(Hr, { style: hr }),
                    React.createElement(Text, { style: sectionTitle }, 'Items listed'),
                    ...items.map((item, index) =>
                        React.createElement(Section, { key: index, style: itemContainer },
                            React.createElement(Row, null,
                                React.createElement(Column, { style: { width: '70%' } },
                                    React.createElement(Text, { style: itemName }, item.name),
                                    React.createElement(Text, { style: itemDetail }, `จำนวน: ${item.quantity} × ${Number(item.unit_price).toLocaleString('th-TH')} บาท`)
                                ),
                                React.createElement(Column, { style: { width: '30%', textAlign: 'right' } },
                                    React.createElement(Text, { style: itemPrice },
                                        `${(Number(item.unit_price) * item.quantity).toLocaleString('th-TH')} บาท`
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(Hr, { style: hr }),
                    React.createElement(Row, null,
                        React.createElement(Column, { style: { width: '70%', textAlign: 'right' } },
                            React.createElement(Text, { style: totalLabel }, 'Total Amount:')
                        ),
                        React.createElement(Column, { style: { width: '30%', textAlign: 'right' } },
                            React.createElement(Text, { style: totalAmount }, `${Number(total).toLocaleString('th-TH')} บาท`)
                        )
                    ),
                    React.createElement(Hr, { style: hr }),
                    React.createElement(Text, { style: paragraph },
                        'Your items will be shipped within 3-5 business days. You will receive a notification email once your items have been dispatched.'
                    ),

                    // Track Order Button
                    React.createElement(Section, { style: { textAlign: 'center', margin: '32px 0' } },
                        React.createElement('a', {
                            href: `http://localhost:5173/track-order?order=${orderId}`,
                            style: buttonStyle
                        }, 'ติดตามสถานะการจัดส่ง')
                    ),

                    React.createElement(Text, { style: paragraph },
                        'If you have any questions or need assistance, please contact us at ',
                        React.createElement('a', { href: 'mailto:support@radiatorshop.com', style: link }, 'support@radiatorshop.com')
                    )
                ),
                React.createElement(Section, { style: footer },
                    React.createElement(Text, { style: footerText }, '© 2025 Custom Radiator Shop. All rights reserved.'),
                    React.createElement(Text, { style: footerText }, 'This email was sent to confirm your order')
                )
            )
        )
    );
};

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif, "Sarabun", "Noto Sans Thai"',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    backgroundColor: '#ef4444',
    padding: '30px 40px',
    textAlign: 'center',
};

const title = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0',
};

const content = {
    padding: '40px',
};

const greeting = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#6b7280',
    marginBottom: '16px',
};

const sectionTitle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: '24px',
    marginBottom: '16px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const infoRow = {
    marginBottom: '16px',
};

const label = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px 0',
};

const value = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px 0',
};

const addressText = {
    fontSize: '16px',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    margin: '8px 0',
};

const itemContainer = {
    padding: '12px 0',
};

const itemName = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0',
};

const itemDetail = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
};

const itemPrice = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0',
};

const totalLabel = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0',
};

const totalAmount = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ef4444',
    margin: '0',
};

const link = {
    color: '#ef4444',
    textDecoration: 'underline',
};

const footer = {
    backgroundColor: '#f9fafb',
    padding: '20px 40px',
    textAlign: 'center',
};

const footerText = {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '4px 0',
};

// Button style
const buttonStyle = {
    display: 'inline-block',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)',
    transition: 'all 0.3s ease',
};

module.exports = PaymentConfirmation;
