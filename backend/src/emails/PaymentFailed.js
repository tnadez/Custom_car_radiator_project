const React = require('react');
const { Html, Head, Body, Container, Section, Text, Hr, Button } = require('@react-email/components');

const PaymentFailed = ({ orderDetails, retryUrl }) => {
    const { orderId, customerName } = orderDetails;
    return React.createElement(Html, null,
        React.createElement(Head, null),
        React.createElement(Body, { style: main },
            React.createElement(Container, { style: container },
                React.createElement(Section, { style: header },
                    React.createElement(Text, { style: title }, '❌ Payment Failed')
                ),
                React.createElement(Section, { style: content },
                    React.createElement(Text, { style: greeting }, `เรียนคุณ ${customerName || 'ลูกค้า'},`),
                    React.createElement(Text, { style: paragraph },
                        'การชำระเงินของคุณไม่สำเร็จสำหรับคำสั่งซื้อหมายเลข #' + orderId + '. กรุณาตรวจสอบข้อมูลบัตรหรือยอดเงิน และลองชำระเงินใหม่อีกครั้ง'
                    ),
                    React.createElement(Hr, { style: hr }),
                    React.createElement(Button, {
                        href: retryUrl,
                        style: buttonStyle
                    }, 'กลับไปชำระเงินอีกครั้ง'),
                    React.createElement(Text, { style: paragraph },
                        'หากมีข้อสงสัย กรุณาติดต่อ support@radiatorshop.com'
                    )
                ),
                React.createElement(Section, { style: footer },
                    React.createElement(Text, { style: footerText }, '© 2025 Custom Radiator Shop. All rights reserved.')
                )
            )
        )
    );
};

const main = { backgroundColor: '#f6f9fc', fontFamily: 'Sarabun, Noto Sans Thai, sans-serif' };
const container = { backgroundColor: '#fff', margin: '0 auto', padding: '20px 0', maxWidth: '600px' };
const header = { backgroundColor: '#ef4444', padding: '30px 40px', textAlign: 'center' };
const title = { color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: 0 };
const content = { padding: '40px' };
const greeting = { fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' };
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#6b7280', marginBottom: '16px' };
const hr = { borderColor: '#e5e7eb', margin: '24px 0' };
const buttonStyle = { background: 'linear-gradient(90deg,#ef4444,#f87171)', color: '#fff', padding: '12px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '18px', textDecoration: 'none', border: 'none', display: 'inline-block', margin: '24px 0' };
const footer = { textAlign: 'center', marginTop: '32px' };
const footerText = { fontSize: '12px', color: '#9ca3af' };

module.exports = PaymentFailed;
