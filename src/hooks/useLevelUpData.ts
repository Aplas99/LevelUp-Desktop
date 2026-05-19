import { useCallback, useEffect, useRef, useState } from "react";
import type { AppData } from "../types/appData";
import {
  getAppDataFilePath,
  loadAppData,
  saveAppData,
} from "../services/storageService";

export function useLevelUpData() {
  const [data, setData] = useState<AppData | null>(null);
  const [dataPath, setDataPath] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef<AppData | null>(null);

  useEffect(() => {
    async function initializeData() {
      try {
        const loadedData = await loadAppData();
        const filePath = await getAppDataFilePath();

        setData(loadedData);
        dataRef.current = loadedData;
        setDataPath(filePath);
        setStatus("Data loaded successfully.");
      } catch (error) {
        console.error(error);
        setStatus("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    }

    initializeData();
  }, []);

  const updateData = useCallback(
    async (updater: (currentData: AppData) => AppData) => {
      const currentData = dataRef.current;

      if (!currentData) return null;

      try {
        const updatedData = updater(currentData);
        setData(updatedData);
        dataRef.current = updatedData;

        const savedData = await saveAppData(updatedData);

        setData(savedData);
        dataRef.current = savedData;
        setStatus("Progress saved.");

        return savedData;
      } catch (error) {
        console.error(error);
        setStatus("Failed to save data.");
        return null;
      }
    },
    [],
  );

  return {
    data,
    dataPath,
    status,
    isLoading,
    updateData,
  };
}
