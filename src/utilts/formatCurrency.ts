export function formatVND(value: number | string) {
  const numberValue = Number(value) || 0;
  return `${numberValue.toLocaleString('vi-VN')} đ`;
}