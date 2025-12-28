import { useState, useEffect, useMemo, useRef } from 'react';
import { Camera, ArrowLeft, Plus } from 'lucide-react';
import { NepaliDatePicker } from '@kkeshavv18/nepali-datepicker';
import NepaliDate from 'nepali-date-converter';
import { resizeAndEncode } from '../imageResizer.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

const getTodayNepali = () => new NepaliDate().format('YYYY-MM-DD');

const calculateWeight = (weightString) => {
  if (!weightString) return 0;
  try {
    const cleanString = weightString.replace(/\s*\+\s*$/, ''); 
    const parts = cleanString.split('+');
    const sum = parts.reduce((acc, part) => {
      const num = parseFloat(part.trim());
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    return sum;
  } catch (e) {
    console.error("Error parsing weight string:", e);
    return 0;
  }
};

export default function AddTransactionForm({ customer, onSave, onCancel, initialData, onDelete }) {
  const { t } = useLanguage();
  
  const weightInputRef = useRef(null);

  // (All state is unchanged)
  const [mainType, setMainType] = useState(initialData?.mainType || 'crops');
  const [date, setDate] = useState(initialData?.date || getTodayNepali());
  const [tractorService, setTractorService] = useState(initialData?.type || 'Rotavator');
  const [rate, setRate] = useState(initialData?.rate || '');
  const [hours, setHours] = useState(initialData?.hours || '');
  const [minutes, setMinutes] = useState(initialData?.minutes || '');
  const [numTrolleys, setNumTrolleys] = useState(initialData?.numTrolleys || '');
  const [cropTradeType, setCropTradeType] = useState(initialData?.type || 'crop_buy');
  const [cropType, setCropType] = useState(initialData?.cropType || 'Rice(धान)');
  const [weightInput, setWeightInput] = useState(
    initialData?.weight ? String(initialData.weight) : ''
  );
  const totalWeight = useMemo(() => calculateWeight(weightInput), [weightInput]);
  const [cashType, setCashType] = useState(initialData?.type || 'cash_given');
  const [cashAmount, setCashAmount] = useState(initialData?.totalAmount || '');
  const [cashDetails, setCashDetails] = useState(initialData?.details || '');
  const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount || 0);
  const [amountPaid, setAmountPaid] = useState(initialData?.amountPaid || '');
  const [billPhotoBase64, setBillPhotoBase64] = useState(initialData?.billPhotoBase64 || null);
  const [isUploading, setIsUploading] = useState(false);
  
  // (All useEffects are unchanged)
  // (Replace the current useEffect with this one)
useEffect(() => {
  if (mainType === 'cash') {
    setTotalAmount(parseFloat(cashAmount) || 0);
    return;
  }
  const numRate = parseFloat(rate) || 0;
  let newTotal = 0;
  if (mainType === 'tractor') {
    if (['Rotavator', 'Threser'].includes(tractorService)) {
      const numHours = parseFloat(hours) || 0;
      const numMinutes = parseFloat(minutes) || 0;
      const totalTime = numHours + numMinutes / 60;
      newTotal = totalTime * numRate;
    } else if (['Dhunga Trolley', 'Gitti trolley', 'Daura'].includes(tractorService)) {
      const trolleys = parseFloat(numTrolleys) || 0;
      newTotal = trolleys * numRate;
    }
  } else if (mainType === 'crops') {
    newTotal = totalWeight * numRate;
  }
  setTotalAmount(parseFloat(newTotal.toFixed(1)));
}, [mainType, tractorService, rate, hours, minutes, numTrolleys, totalWeight, cashAmount]);

  // (All other handlers are unchanged)
  const handleSubmit = () => {
    if (isUploading) { alert("Please wait for the image to finish processing."); return; }
    if (!date) { alert('Please select a date for the transaction.'); return; }
    
    // Input validation for numeric fields
    const validateNumericRange = (value, fieldName, min = 0, max = 99999999) => {
      const num = parseFloat(value);
      if (value && (isNaN(num) || num < min || num > max)) {
        alert(`${fieldName} must be a valid number between ${min} and ${max}.`);
        return false;
      }
      return true;
    };
    
    let transactionData = { 
      id: initialData?.id,
      customerId: customer.id, 
      date: date,
      billPhotoBase64: billPhotoBase64,
      createdAt: initialData?.createdAt
    };

    if (mainType === 'tractor') {
      // Validate tractor inputs
      if (!validateNumericRange(rate, 'Rate', 0, 99999999)) return;
      if (!validateNumericRange(hours, 'Hours', 0, 999)) return;
      if (!validateNumericRange(minutes, 'Minutes', 0, 59)) return;
      if (!validateNumericRange(numTrolleys, 'Number of trolleys', 0, 999)) return;
      if (!validateNumericRange(amountPaid, 'Amount paid', 0, 99999999)) return;
      
      const paid = parseFloat(amountPaid) || 0;
      if (totalAmount <= 0) { alert('Please fill in the tractor details.'); return; }
      const dueAmount = parseFloat((totalAmount - paid).toFixed(1));
      transactionData = { ...transactionData, mainType, type: tractorService, details: `${tractorService} (Rate: ${rate})`, totalAmount, amountPaid: paid, dueAmount, rate, hours, minutes, numTrolleys };
    } else if (mainType === 'crops') {
      // Validate crop inputs
      if (!validateNumericRange(rate, 'Rate per kg', 0, 99999)) return;
      if (!validateNumericRange(amountPaid, 'Amount paid', 0, 99999999)) return;
      if (totalWeight < 0 || totalWeight > 9999999) {
        alert('Weight must be a valid number between 0 and 9999999.');
        return;
      }
      
      const paid = parseFloat(amountPaid) || 0;
      if (totalWeight <= 0) { alert('Please enter a weight.'); return; }
      if (totalAmount <= 0) { alert('Please fill in the crop details.'); return; }
      let dueAmount = (cropTradeType === 'crop_sell') ? (totalAmount - paid) : (paid - totalAmount);
      dueAmount = parseFloat(dueAmount.toFixed(1));

      transactionData = { 
        ...transactionData, 
        mainType, 
        type: cropTradeType, 
        details: `${cropTradeType === 'crop_buy' ? 'Bought' : 'Sold'} ${totalWeight.toFixed(1)}kg ${cropType}`, 
        totalAmount, 
        amountPaid: paid, 
        dueAmount, 
        cropType, 
        weight: totalWeight, 
        weightInput: weightInput,
        rate 
      };
    } else if (mainType === 'cash') {
      // Validate cash inputs
      const trimmedDetails = cashDetails.trim();
      if (trimmedDetails.length > 200) {
        alert('Details must be less than 200 characters.');
        return;
      }
      if (!validateNumericRange(cashAmount, 'Amount', 0, 99999999)) return;
      
      const amt = parseFloat(cashAmount) || 0;
      if (amt <= 0) { alert('Please enter a cash amount.'); return; }
      let dueAmount = (cashType === 'cash_taken') ? -amt : amt;
      dueAmount = parseFloat(dueAmount.toFixed(1));
      let details = trimmedDetails || (cashType === 'cash_taken' ? 'Cash Taken' : 'Cash Given');
      transactionData = { ...transactionData, mainType, type: cashType, details, totalAmount: amt, amountPaid: amt, dueAmount };
    }
    
    if (!transactionData.id) {
      transactionData.createdAt = new Date();
    }
    
    onSave(transactionData);
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setBillPhotoBase64(null);
    try {
      const base64String = await resizeAndEncode(file);
      setBillPhotoBase64(base64String);
      setIsUploading(false);
    } catch (error) { console.error("Error resizing image: ", error); alert("Error processing image."); setIsUploading(false); }
  };
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount.toFixed(1));
  
  const renderTractorFields = () => (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <label className="block text-sm font-medium text-gray-700">{t('tractor_services')}</label>
      <select value={tractorService} onChange={(e) => setTractorService(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md">
        <option value="Rotavator">Rotavator</option>
        <option value="Threser">Threser</option>
        <option value="Dhunga Trolley">Dhunga Trolley</option>
        <option value="Gitti trolley">Gitti Trolley</option>
        <option value="Daura">Daura</option>
      </select>
      
      {['Rotavator', 'Threser'].includes(tractorService) ? (
        <><div className="flex space-x-4"><div className="flex-1"><label>{t('hours')}</label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 1" inputMode="decimal" />
        </div>
        <div className="flex-1"><label>{t('minutes')}</label>
        <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 30" inputMode="decimal" /></div></div>
        <div><label>{t('rate_per_hour')}</label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 1500" inputMode="decimal" /></div></>
      ) : (
        <><div className="flex-1"><label>{t('number_of_trolleys')}</label>
        <input type="number" value={numTrolleys} onChange={(e) => setNumTrolleys(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 2" inputMode="decimal" /></div>
        <div className="flex-1"><label>{t('rate_per_trolley')}</label><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 1000" inputMode="decimal" /></div></>
      )}
    </div>
  );
  
  const handleAddPlus = (e) => {

    e.preventDefault(); 
    
    const newValue = weightInput + ' + ';
    
    setWeightInput(newValue);
    
    setTimeout(() => {
      if (weightInputRef.current) {
        weightInputRef.current.focus();
        const newLength = newValue.length;
        weightInputRef.current.setSelectionRange(newLength, newLength);
      }
    }, 0);
  };
  
  const renderCropsFields = () => (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <label>{t('trade_type')}</label>
          <select value={cropTradeType} onChange={(e) => setCropTradeType(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md">
            <option value="crop_buy">{t('buy')}</option>
            <option value="crop_sell">{t('sell')}</option>
          </select>
        </div>
        <div className="flex-1">
          <label>{t('crop_type')}</label>
          <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md">
            <option value="Wheat(गहुँ)">{t('wheat')}</option>
            <option value="Rice(धान)">{t('rice')}</option>
            <option value="Maize(मकै)">{t('maize')}</option>
            <option value="Rice(चामल)">{t('rice_2')}</option>
            <option value="Gas(ग्यास)">{t('gas')}</option>
          </select>
        </div>
      </div>
      
      <div>
        <label>{t('total_weight')}</label>
        <div className="flex space-x-2 mt-1">
          <input 
            type="text"
            inputMode="decimal"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1 block w-full p-3 border border-gray-300 rounded-md"
            placeholder="e.g. 50.5 or 50.5 + 51.2"
            ref={weightInputRef}
          />
          <button 
          
            onMouseDown={handleAddPlus} 
            className="px-4 py-3 bg-blue-600 text-white rounded-md font-medium"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {(weightInput.includes('+') || (totalWeight > 0 && !isNaN(parseFloat(weightInput)))) && (
          <p className="text-right text-lg font-bold text-gray-800 mt-2">
            Total: {totalWeight.toFixed(2)} kg
          </p>
        )}
      </div>

      <div>
        <label>{t('rate_per_kg')}</label>
        <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 30" inputMode="decimal" />
      </div>
    </div>
  );
  
  const renderCashFields = () => (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <div><label className="block text-sm font-medium text-gray-700">{t('cash_transaction')}</label><select value={cashType} onChange={(e) => setCashType(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md"><option value="cash_taken">Cash Taken (पैसा लिएको)</option><option value="cash_given">Cash Given (पैसा दिएको)</option></select></div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount (Rs.)</label>
        <input type="number" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 5000" inputMode="decimal" min="0" max="99999999" />
      </div>
      <div><label className="block text-sm font-medium text-gray-700">Details</label><input type="text" value={cashDetails} onChange={(e) => setCashDetails(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. Advance payment" maxLength={200} /></div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b sticky top-0 z-10 flex items-center space-x-4">
        <button onClick={onCancel} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">
          {initialData ? 'Edit Transaction' : t('new_transaction_for')} 
          <span className="text-blue-600"> {customer?.name}</span>
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
          <NepaliDatePicker
            className="mt-1 block w-full"
            inputClassName="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            initialDate={date}
            onDateChange={(dateString) => setDate(dateString)}
            inputProps={{
              readOnly: true,
              onMouseDown: (e) => e.preventDefault(),
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('transaction_type')}</label>
          <select value={mainType} onChange={(e) => setMainType(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm">
            <option value="crops">{t('crops_buy_sell')}</option>
            <option value="tractor">{t('tractor_services')}</option>
            <option value="cash">{t('cash_transaction')}</option>
          </select>
        </div>
        
        {mainType === 'tractor' && renderTractorFields()}
        {mainType === 'crops' && renderCropsFields()}
        {mainType === 'cash' && renderCashFields()}
        
        {mainType !== 'cash' && (
          <>
            <div className="flex space-x-4 pt-4">
              <div className="flex-1"><label>{t('total_amount')}</label><input type="text" readOnly value={`Rs. ${formatCurrency(totalAmount)}`} className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-100 font-bold" /></div>
              <div className="flex-1">
                <label>{mainType === 'crops' && cropTradeType === 'crop_buy' ? t('amount_paid') : t('amount_received')}</label>
                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" placeholder="e.g. 1000" inputMode="decimal" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">{mainType === 'crops' && cropTradeType === 'crop_buy' ? t('remaining_to_pay') : t('reamining_to_collect')}</p>
              <p className={`text-2xl font-bold ${totalAmount - (parseFloat(amountPaid) || 0) > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                Rs. {formatCurrency(totalAmount - (parseFloat(amountPaid) || 0))}
              </p>
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo of Bill (Optional)</label>
          <input type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleFileChange} />
          {isUploading && <p className="text-blue-600 text-sm mt-1">Processing image...</p>}
          {billPhotoBase64 && !isUploading && (
            <div className="mt-2">
              <p className="text-green-600 text-sm">Image ready!</p>
              <img src={billPhotoBase64} alt="Bill preview" className="w-24 h-24 object-cover rounded-md border border-gray-300" />
            </div>
          )}
        </div>
        
      </div>

      <footer className="p-4 bg-white border-t space-y-3">
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700">
          {initialData ? 'Save Changes' : t('save_transaction')}
        </button>

        {initialData && (
          <button 
            onClick={() => onDelete(initialData.id)} 
            className="w-full bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700"
          >
            Delete Transaction
          </button>
        )}
      </footer>
    </div>
  );
}