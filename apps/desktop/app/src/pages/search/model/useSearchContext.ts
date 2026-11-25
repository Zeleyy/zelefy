import { useOutletContext } from "react-router";
import type { SearchTabProps } from "./types";

export const useSearchContext = () => useOutletContext<SearchTabProps>();
