/**
  A centralized component of all the provider from different libraries
 */

import React from "react";
import {Provider} from "react-redux";
import {store} from "@/redux/store";

interface ProvidersProps {
    children: React.ReactNode;
}

const Providers = ({children}: ProvidersProps) => {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}
export default Providers
