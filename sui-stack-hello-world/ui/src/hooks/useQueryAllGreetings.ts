// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
// Fix: useQuery must be imported from @tanstack/react-query, not @mysten/dapp-kit
import { useQuery } from "@tanstack/react-query";
import { useNetworkVariable } from "../networkConfig";

export interface GreetingObject {
  objectId: string;
  text: string;
  owner: string;
  created_at: number;
  updated_count: number;
}

export function useQueryAllGreetings() {
  const client = useSuiClient();
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");

  const { data, isLoading, error } = useQuery({
    queryKey: ["all_greetings", helloWorldPackageId],
    queryFn: async () => {
      if (!helloWorldPackageId) return [];

      try {
        const objects = await client.getOwnedObjects({
          owner: "0x0", // Query all objects of this type
          filter: {
            MatchAll: [
              {
                StructType: `${helloWorldPackageId}::greeting::Greeting`,
              },
            ],
          },
          options: {
            showContent: true,
            showOwner: true,
          },
        });

        return (objects.data || [])
          .map((obj) => {
            if (obj.data?.content?.dataType === "moveObject") {
              const content = obj.data.content as any;
              const fields = content.fields as any;
              return {
                objectId: obj.data.objectId,
                text: fields?.text || "",
                owner: fields?.owner || "",
                created_at: fields?.created_at || 0,
                updated_count: fields?.updated_count || 0,
              };
            }
            return null;
          })
          .filter(Boolean);
      } catch (err) {
        console.error("Error fetching greetings:", err);
        return [];
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  return {
    allGreetings: data || [],
    isLoading,
    error,
  };
}
