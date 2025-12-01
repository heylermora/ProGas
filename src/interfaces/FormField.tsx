interface FormField {
    label: string;
    name: string;
    type: string;
    value: any;
    helper?: any;
    validation?: any;
    isDisabled?: boolean;
    onChange?: (value: any) => void;
  }
  export default FormField;