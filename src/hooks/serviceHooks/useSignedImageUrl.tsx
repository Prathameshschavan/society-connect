// hooks/useSignedImageUrl.ts
import { useState, useEffect } from "react";
import useExpenseService from "./useExpenseService";

export function useSignedImageUrl(imagePath: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { getExpenseImageUrl } = useExpenseService();

  useEffect(() => {
    if (!imagePath) {
      setSignedUrl("");
      setLoading(false);
      setError(false);
      return;
    }

    let isCancelled = false;

    const fetchUrl = async () => {
      setLoading(true);
      setError(false);

      try {
        const url = await getExpenseImageUrl(imagePath);
        if (!isCancelled) {
          setSignedUrl(url);
        }
      } catch (err) {
        console.log(err);
        if (!isCancelled) {
          setError(true);
          setSignedUrl("");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUrl();

    return () => {
      isCancelled = true;
    };
  }, [imagePath]);

  return { signedUrl, loading, error };
}
