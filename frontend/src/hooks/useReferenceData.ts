import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RefData {
  nationalites: { id: number; label: string }[];
  societes: { id: number; label: string }[];
  vols: { id: number; numero: string; destination: string }[];
  documents: { id: number; label: string }[];
  typeFraudes: { id: number; label: string }[];
}

export function useReferenceData() {
  const [data, setData] = useState<RefData>({
    nationalites: [], societes: [], vols: [], documents: [], typeFraudes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [nat, soc, vol, doc, tf] = await Promise.all([
        supabase.from("nationalites").select("*").order("label"),
        supabase.from("societes").select("*").order("label"),
        supabase.from("vols").select("*").order("numero"),
        supabase.from("documents").select("*").order("label"),
        supabase.from("type_fraudes").select("*").order("label"),
      ]);
      setData({
        nationalites: (nat.data as any) || [],
        societes: (soc.data as any) || [],
        vols: (vol.data as any) || [],
        documents: (doc.data as any) || [],
        typeFraudes: (tf.data as any) || [],
      });
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { ...data, loading };
}
