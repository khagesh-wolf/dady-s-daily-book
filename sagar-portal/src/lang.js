// src/lang.js
export const translations = {
  // Navigation
  nav_customers: { en: 'Customers', ne: 'ग्राहकहरू' },
  nav_dashboard: { en: 'Dashboard', ne: 'ड्यासबोर्ड' },
  nav_settings: { en: 'Settings', ne: 'सेटिङहरू' },
  
  // Customer List
  search_placeholder: { en: 'Search by name or phone...', ne: 'नाम वा फोनद्वारा खोज्नुहोस्...' },
  due: { en: 'लिनुपर्ने', ne: 'लिनुपर्ने' },
  owed: { en: 'तिर्नुपर्ने', ne: 'तिर्नुपर्ने' },
  settled: { en: 'बराबर', ne: 'मिलाइयो' },

  // Customer Detail
  phone: { en: 'Phone(फोन)', ne: 'फोन' },
  address: { en: 'Address(ठेगाना)', ne: 'ठेगाना' },
  call: { en: 'Call', ne: 'कल' },
  whatsapp: { en: 'WhatsApp', ne: 'व्हाट्सएप' },
  remaining_dues: { en: 'Remaining Dues (पाउनु पर्ने)', ne: 'जम्मा बाँकी (पाउनु पर्ने)' },
  we_owe: { en: 'We Owe (तिर्नु पर्ने)', ne: 'तिर्नु पर्ने (क्रेडिट)' },
  balance_settled: { en: 'Balance Settled', ne: 'ब्यालेन्स मिलाइयो' },
  add_new_transaction: { en: 'Add New Transaction', ne: 'नयाँ कारोबार थप्नुहोस्' },
  latest_transactions: { en: 'Latest Transactions', ne: 'पछिल्लो कारोबारहरू' },
  show_all_transactions: { en: 'Show All Transactions', ne: 'सबै कारोबारहरू हेर्नुहोस्' },
  send_whatsapp_reminder: { en: 'Send WhatsApp Reminder', ne: 'रिमाइन्डर पठाउनुहोस्' },
  delete_customer: { en: 'Delete This Customer', ne: 'यो ग्राहक मेटाउनुहोस्' },
  delete_confirm_message: { 
    en: 'Are you sure?\n\nThis will move this customer to Recently Deleted. They will be permanently deleted after 60 days.', 
    ne: 'के तपाई पक्का हुनुहुन्छ?\n\nयसले यो ग्राहकलाई "हालै मेटाइएको" मा सार्नेछ। तिनीहरू ६० दिन पछि स्थायी रूपमा मेटिनेछन्।' 
  },

  // Add Customer Form
  add_new_customer: { en: 'Add New Customer', ne: 'नयाँ ग्राहक थप्नुहोस्' },
  full_name: { en: 'Full Name', ne: 'पुरा नाम' },
  phone_number: { en: 'Phone Number', ne: 'फोन नम्बर' },
  address_village: { en: 'Address / Village', ne: 'ठेगाना / गाउँ' },
  save_customer: { en: 'Save Customer', ne: 'ग्राहक सेभ गर्नुहोस्' },

  // Add Transaction Form
  new_transaction_for: { en: 'New Transaction for', ne: 'को लागि नयाँ कारोबार' },
  date: { en: 'Date(मिति)', ne: 'मिति' },
  transaction_type: { en: 'Transaction Type', ne: 'कारोबारको प्रकार' },
  tractor_services: { en: 'Tractor Services', ne: 'ट्रयाक्टर सेवाहरू' },
  crops_buy_sell: { en: 'Crops Buy / Sell', ne: 'फसल किन/बेच' },
  cash_transaction: { en: 'Cash Transaction', ne: 'नगद कारोबार' },
  save_transaction: { en: 'Save Transaction', ne: 'कारोबार सेभ गर्नुहोस्' },
  trade_type: { en: 'Trade Type', ne: 'व्यापारको प्रकार' },
  buy: { en: 'Buy(खरिद)', ne: 'खरिद/किन्ने' },
  sell: { en: 'Sell(बिक्रि)', ne: 'बिक्रि/बेच्ने' },
  wheat: { en: 'Wheat(गहुँ)', ne: 'गहुँ' },
  rice: { en: 'Rice(धान)', ne: 'धान' },
  rice_2: { en: 'Rice(चामल)', ne: 'चामल' },
  maize: { en: 'Maize(मकै)', ne: 'मकै' },
  total_weight: { en: 'Total Weights(तौल)', ne: 'जम्मा तौल' },
  rate_per_kg: { en: 'Rate per Kg(दर प्रति केजी)', ne: 'दर प्रति केजी' },
  crop_type: { en: 'Crop Type(फसलको प्रकार)', ne: 'फसलको प्रकार' },
  hours: { en: 'Hours(घण्टा)', ne: 'घण्टा' },
  rate_per_hour: { en: 'Rate per Hour(दर प्रति घण्टा)', ne: 'दर प्रति घण्टा' },
  minutes: { en: 'Minutes(मिनेट)', ne: 'मिनेट' },
  number_of_trolleys: { en: 'Number of Trolleys(ट्रलीको संख्या)', ne: 'ट्रलीको संख्या' },
  rate_per_trolley: { en: 'Rate per Trolley(दर प्रति ट्रली)', ne: 'दर प्रति ट्रली' },
  amount_paid: { en: 'Amount Paid(तिरेको)', ne: 'तिरेको रकम' },
  total_amount: { en: 'Total Amount(जम्मा रकम)', ne: 'जम्मा रकम' }, 
  amount_received: { en: 'Amount Received(पाएको)', ne: 'पा‍एको रकम' }, 
  remaining_to_pay: { en: 'Remaining to Pay(बाँकी तिर्नुपर्ने)', ne: 'बाँकी तिर्नु पर्ने' },
  reamining_to_collect: { en: 'Remaining to Collect(बाँकी पा‍‍उनुपर्ने)', ne: 'बाँकी पा‍‍उनुपर्ने' },
  // Dashboard
  total_to_collect: { en: 'To Collect(उठाउनु पर्ने)', ne: 'जम्मा उठाउनु पर्ने' },
  total_to_pay: { en: 'To Pay(तिर्नु पर्ने)', ne: 'जम्मा तिर्नु पर्ने' },
  expenses: { en: 'Expenses(खर्च)', ne: 'खर्च' },
  add: { en: 'Add', ne: 'थप्नुहोस्' },
  
  // Settings
  security: { en: 'Security', ne: 'सुरक्षा' },
  set_change_pin: { en: 'Set / Change PIN', ne: 'पिन सेट/परिवर्तन गर्नुहोस्' },
  preferences: { en: 'Preferences', ne: 'प्राथमिकताहरू' },
  language: { en: 'Language(भाषा)', ne: 'भाषा' },
  data_backup: { en: 'Data Backup', ne: 'डाटा ब्याकअप' },
  download_local_backup: { en: 'Download Local Backup (JSON)', ne: 'स्थानीय ब्याकअप डाउनलोड गर्नुहोस्' },
  import_from_backup: { en: 'Import from Backup', ne: 'ब्याकअपबाट आयात गर्नुहोस्' },
  sync_to_google_drive: { en: 'Sync to Google Drive', ne: 'Google Drive मा सिङ्क गर्नुहोस्' },
  about_the_app: { en: 'About the App', ne: 'एपको बारेमा' },
  version: { en: 'Version', ne: 'संस्करण' },
  created_by: { en: 'Developed by', ne: 'यसद्वारा बनाइएको' },
  idea_by: { en: 'Idea by', ne: 'यसद्वारा विचार गरीएको' },

  //Add Customer Form
  edit_customer: { en: 'Edit Customer(ग्राहक सम्पादन गर्नुहोस्)', ne: 'ग्राहक सम्पादन गर्नुहोस्' },
  name: { en: 'Name(नाम)', ne: 'नाम' },
  phone_optional: { en: 'Phone (Optional)(फोन (वैकल्पिक))', ne: 'फोन (वैकल्पिक)' },
  address_optional: { en: 'Address (Optional)(ठेगाना (वैकल्पिक))', ne: 'ठेगाना (वैकल्पिक)' },
  save_changes: { en: 'Save Changes(परिवर्तनहरू सेभ गर्नुहोस्)', ne: 'परिवर्तनहरू सेभ गर्नुहोस्' },
};