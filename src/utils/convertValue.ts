import ExchangeRateService from 'services/ExchangeRateService';
import { formatValue } from 'utils/formatValue';

export const convertValue = async (name: string, value: string, date: string) => {
  try {
    console.log(name,value)
    date = date.replaceAll('-', '/')
    const exchangeRate = await ExchangeRateService.get(date, date);
    const exchangeValue = parseFloat(exchangeRate[0].value);
    let newName = name;
    console.log("2:", name,value)
    let newValue = parseFloat(value.replaceAll(',',''));
    
    if (name.includes('USD')) {
      newName = name.replace('USD', 'COL');
      newValue *= exchangeValue;
    } else if (name.includes('COL')) {
      newName = name.replace('COL', 'USD');
      newValue /= exchangeValue;
    }
    newValue = parseFloat(newValue.toFixed(2));
    const formattedValue = formatValue(newValue.toString());
    return { newName: newName, newValue: formattedValue };
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return { newName: name, newValue: value };
  }
}
