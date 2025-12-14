export const currMonth = `${(new Date().getMonth() + 1)
  .toString()
  .padStart(2, "0")}`;

export const formatMonthNum = (num: string | number) => {
  return num.toString().padStart(2, "0");
};

export const currYear = `${new Date().getFullYear()}`;
export const currDate = `${new Date().getDate()}`;
export const currFullDate = `${currYear}-${currDate}-${currMonth}`;
export const currFullDateForInput = `${currYear}-${currMonth}-${currDate}`;
export const shortMonth = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const longMonth = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(inputDate: string) {

  
  const date = new Date(inputDate);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }); // e.g. Oct
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
}

export function getMonthAndYearFromDate(inputDate: string) {
  const date = new Date(inputDate);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return { month, year };
}

export function formatDateforInput(inputDate: string) {
  const date = new Date(inputDate);

  const day = date.getDate();
  const month = date.getMonth() + 1; // e.g. Oct
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

export function isPassedDueDate(societyDueDate: number | "last", inputDate?: string): boolean {
  const checkDate = inputDate ? new Date(inputDate) : new Date();
  checkDate.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparison

  const year = checkDate.getFullYear();
  const month = checkDate.getMonth(); // 0-indexed month

  let calculatedDueDate: Date;

  if (societyDueDate === "last") {
    // Get the last day of the current month
    // Setting day to 0 of the next month gives the last day of the current month
    calculatedDueDate = new Date(year, month + 1, 0);
  } else {
    // societyDueDate is a number representing the day of the month
    calculatedDueDate = new Date(year, month, societyDueDate);
  }

  calculatedDueDate.setHours(0, 0, 0, 0); // Normalize due date to start of the day

  return checkDate > calculatedDueDate;
}