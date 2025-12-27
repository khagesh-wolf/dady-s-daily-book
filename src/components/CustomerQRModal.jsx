import { X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const PORTAL_BASE_URL = 'https://sagar-portal.web.app';

export default function CustomerQRModal({ customer, onClose }) {
  const portalUrl = `${PORTAL_BASE_URL}/customer/${customer.accessKey}`;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">QR Code for {customer.name}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Scan this code to view your read-only transaction history.
          <strong className="block mt-1 text-red-600">Treat this code like a password and keep it private.</strong>
        </p>

        <div className="w-full flex justify-center p-4 bg-gray-50 rounded-lg">
          <QRCodeCanvas
            value={portalUrl}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={true}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 break-all">
            URL: {portalUrl}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}