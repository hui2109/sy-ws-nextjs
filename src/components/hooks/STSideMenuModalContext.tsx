import {createContext, Dispatch, SetStateAction, useContext} from "react";

interface ISTSideMenuModalContext {
    isModalOpen: boolean,
    setIsModalOpen: Dispatch<SetStateAction<boolean>>,
    modalKey: string,
}

export const STSideMenuModalContext = createContext<ISTSideMenuModalContext | null>(null);

export function useSTSideMenuModalContext() {
    const context = useContext(STSideMenuModalContext);
    if (!context) {
        throw new Error("useSTSideMenuModalContext must be used within a STSideMenuModalContext");
    }
    return context;
}