export const formatValue = (value: string) => {
    const numberValue = parseFloat(value.replace(/,/g, "").replace(/[^\d.-]/g, ""));

    if (isNaN(numberValue)) {
      return '0';
    }

    if (value.length > 19) {
      return value.slice(0, 19);
    }

    const formattedValue = numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedValue;
  }