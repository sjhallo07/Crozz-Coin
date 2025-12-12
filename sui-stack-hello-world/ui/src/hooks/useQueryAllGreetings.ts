// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
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
          owner: "0x0",
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
          .map((obj: any) => {
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
    enabled: !!helloWorldPackageId,
  });

  return { greetings: data || [], isLoading, error };
}
