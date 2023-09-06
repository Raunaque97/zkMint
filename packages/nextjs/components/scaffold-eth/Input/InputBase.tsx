import { ChangeEvent, ReactNode, useCallback } from "react";
import { useDarkMode } from "usehooks-ts";
import { CommonInputProps } from "~~/components/scaffold-eth";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const InputBase = <T extends { toString: () => string } | undefined = string>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
}: InputBaseProps<T>) => {
  const { isDarkMode } = useDarkMode();

  let modifier = "";
  if (error) {
    modifier = "border-error";
  } else if (disabled) {
    modifier = "border-disabled bg-base-300";
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );

  return (
    <div
      className={`flex border-2 border-base-300 ${
        isDarkMode ? "bg-slate-950" : " bg-neutral-300"
      } rounded-full text-accent ${modifier}`}
    >
      {prefix}
      <input
        className={`input input-ghost h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-gray-600 ${
          isDarkMode ? "text-gray-400 bg-slate-950" : " text-gray-800 bg-neutral-300"
        }`}
        placeholder={placeholder}
        name={name}
        value={value?.toString()}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
      />
      {suffix}
    </div>
  );
};
