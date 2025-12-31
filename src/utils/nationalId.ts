import { fetchClientNameByCedula } from "services/CedulaService";

export async function handleNationalIdLookup(
  value: string
): Promise<{ fullName: string }> {
  if (value.length === 0) {
    return { fullName: "" };
  }

  // Only digits allowed
  if (/^\d+$/.test(value)) {
    try {
      const fullName = await fetchClientNameByCedula(value);
      console.log(`Client name is: ${fullName}`);
      return { fullName };
    } catch (error) {
      console.error("Error fetching client name:", error);
      return { fullName: "" };
    }
  }
  return { fullName: "" };
}