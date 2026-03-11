export const isChinese = (text: string): boolean => {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
