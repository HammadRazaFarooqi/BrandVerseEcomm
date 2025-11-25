// OrderPrintTemplate.jsx
import { format } from "date-fns";
import PropTypes from "prop-types";

const OrderPrintTemplate = ({ order }) => {
  return (
    <div className="p-8 font-serif text-sm text-black">
      <h1 className="text-2xl font-bold mb-4">Order Receipt</h1>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Date:</strong> {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}</p>
      
      <hr className="my-4" />

      <h2 className="text-lg font-bold mb-2">Customer Info</h2>
      <p>{order.customer?.firstName} {order.customer?.lastName}</p>
      <p>{order.customer?.email}</p>
      <p>{order.customer?.phone}</p>

      <h2 className="text-lg font-bold mt-4 mb-2">Shipping Address</h2>
      <p>{order.customer.address.street}</p>
      <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zip}</p>
      <p>{order.customer.address.country}</p>

      <h2 className="text-lg font-bold mt-4 mb-2">Items</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2 text-left">Product</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item._id}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2 text-center">PKR {item.price.toFixed(2)}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-right">PKR {(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-4">
        <strong>Total: PKR {order.totalAmount.toFixed(2)}</strong>
      </div>
    </div>
  );
};
OrderPrintTemplate.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    customer: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      address: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        country: PropTypes.string,
      }).isRequired,
    }).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
      })
    ).isRequired,
    totalAmount: PropTypes.number.isRequired,
  }).isRequired,
};

export default OrderPrintTemplate;
