export const currMonth = `${(new Date().getMonth() + 1)
  .toString()
  .padStart(2, "0")}`;
export const currYear = `${new Date().getFullYear()}`;
export const currDate = `${new Date().getDate()}`;
export const currFullDate = `${currYear}-${currDate}-${currYear}`;
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
