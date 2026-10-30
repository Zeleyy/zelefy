import styles from "./Select.module.scss";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useClickOutside } from "../../../utils";

interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps {
    options: Option[];
    value?: Option["value"] | Option["value"][];
    onChange: (value: any) => void;
    placeholder?: string;
    isMulti?: boolean;
    disabled?: boolean;
    isSearchable?: boolean;
    isClearable?: boolean;
    className?: string;
    name?: string;
    error?: boolean;
}

export const Select = ({
    options,
    value,
    onChange,
    placeholder = "Выберите...",
    disabled = false,
    error = false,
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setIsOpen(false), isOpen);

    const selected = options.find((o) => o.value === value);

    return (
        <div
            ref={ref}
            className={clsx(styles.select, {
                [styles.selectOpen]: isOpen,
                [styles.error]: error,
                [styles.placeholder]: !selected,
            })}
        >
            <button type="button" disabled={disabled} onClick={() => setIsOpen((p) => !p)}>
                {selected ? selected.label : placeholder}
            </button>

            <ul className={clsx(styles.options, { [styles["options--show"]]: isOpen })}>
                {options.length === 0 && <li className={styles.noOptions}>Нет вариантов</li>}

                {options.map((option) => (
                    <li
                        key={option.value}
                        onClick={() => {
                            if (option.disabled) return;
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={clsx(styles.option, {
                            [styles["option--selected"]]: option.value === value,
                            [styles["option--disabled"]]: option.disabled,
                        })}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};
