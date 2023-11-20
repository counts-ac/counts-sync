
import { useCallback, useEffect, useState } from 'react'

export const useTallyStatus = () => {
    const [status] = useState(false);

    const refetch = useCallback(() => {
        window.ipcRenderer.send("tallyStatus", 'http://localhost:9000');
    }, []);

    useEffect(() => {
        refetch()
    }, [refetch])

    return { status, refetch };
}
