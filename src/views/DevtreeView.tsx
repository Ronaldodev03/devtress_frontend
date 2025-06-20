import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { social } from "../data/social";
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { toast } from "react-toastify";
import { updateProfile } from "../api/DevtreeAPI";
import type { SocialNetwork, User } from "../types";

export default function LinkTreeView() {
  const [devTreeLinks, setDevTreeLinks] = useState(social);

  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["user"])!;

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Actualizado Correctamente");
    },
  });

  useEffect(() => {
    const updatedData = devTreeLinks.map((item) => {
      const userlink = JSON.parse(user.links).find(
        (link: SocialNetwork) => link.name === item.name
      );
      if (userlink) {
        return { ...item, url: userlink.url, enabled: userlink.enabled };
      }
      return item;
    });
    setDevTreeLinks(updatedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLinks = devTreeLinks.map((link) =>
      link.name === e.target.name ? { ...link, url: e.target.value } : link
    );
    setDevTreeLinks(updatedLinks);
  };

  const links: SocialNetwork[] = JSON.parse(user.links);

  // const handleEnableLink = (socialNetwork: string) => {
  //   const updatedLinks = devTreeLinks.map((link) => {
  //     if (link.name === socialNetwork) {
  //       if (isValidUrl(link.url)) {
  //         return { ...link, enabled: !link.enabled };
  //       } else {
  //         toast.error("URL no Válida");
  //       }
  //     }
  //     return link;
  //   });

  //   setDevTreeLinks(updatedLinks);

  //   let updatedItems: SocialNetwork[] = [];
  //   const selectedSocialNetwork = updatedLinks.find(
  //     (link) => link.name === socialNetwork
  //   );
  //   if (selectedSocialNetwork?.enabled) {
  //     const id = links.filter((link) => link.id).length + 1;
  //     if (links.some((link) => link.name === socialNetwork)) {
  //       updatedItems = links.map((link) => {
  //         if (link.name === socialNetwork) {
  //           return {
  //             ...link,
  //             enabled: true,
  //             id,
  //           };
  //         } else {
  //           return link;
  //         }
  //       });
  //     } else {
  //       const newItem = {
  //         ...selectedSocialNetwork,
  //         id,
  //       };
  //       updatedItems = [...links, newItem];
  //     }
  //   } else {
  //     const indexToUpdate = links.findIndex(
  //       (link) => link.name === socialNetwork
  //     );
  //     updatedItems = links.map((link) => {
  //       if (link.name === socialNetwork) {
  //         return {
  //           ...link,
  //           id: 0,
  //           enabled: false,
  //         };
  //       } else if (
  //         link.id > indexToUpdate &&
  //         indexToUpdate !== 0 &&
  //         link.id === 1
  //       ) {
  //         return {
  //           ...link,
  //           id: link.id - 1,
  //         };
  //       } else {
  //         return link;
  //       }
  //     });
  //   }

  //   // Almacenar en la base de datos
  //   queryClient.setQueryData(["user"], (prevData: User) => {
  //     return {
  //       ...prevData,
  //       links: JSON.stringify(updatedItems),
  //     };
  //   });
  // };

  const handleEnableLink = (socialNetwork: string) => {
    // Función para generar el próximo ID único
    const getNextId = (items: SocialNetwork[]) => {
      const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0);
      return maxId + 1;
    };

    // 1. Actualizar el estado local de los links (devTreeLinks)
    const updatedLinks = devTreeLinks.map((link) => {
      if (link.name === socialNetwork) {
        if (isValidUrl(link.url)) {
          return { ...link, enabled: !link.enabled };
        } else {
          toast.error("URL no válida");
          return link; // Mantener el estado actual si la URL no es válida
        }
      }
      return link;
    });

    setDevTreeLinks(updatedLinks);

    // 2. Preparar los items actualizados para la base de datos
    let updatedItems: SocialNetwork[] = [];
    const selectedSocialNetwork = updatedLinks.find(
      (link) => link.name === socialNetwork
    );

    if (selectedSocialNetwork?.enabled) {
      // Caso: Habilitar un link
      const nextId = getNextId(links); // Obtener ID único

      if (links.some((link) => link.name === socialNetwork)) {
        // Si el link ya existía, actualizarlo
        updatedItems = links.map((link) => {
          if (link.name === socialNetwork) {
            return {
              ...link,
              enabled: true,
              id: nextId, // Asignar nuevo ID único
            };
          }
          return link;
        });
      } else {
        // Si es un link nuevo, agregarlo
        updatedItems = [
          ...links,
          {
            ...selectedSocialNetwork,
            id: nextId, // Asignar nuevo ID único
          },
        ];
      }
    } else {
      // Caso: Deshabilitar un link (no modificamos el ID)
      updatedItems = links.map((link) => {
        if (link.name === socialNetwork) {
          return {
            ...link,
            enabled: false,
            // Mantener el ID existente (no lo reseteamos)
          };
        }
        return link;
      });
    }

    // 3. Actualizar la caché de React Query y la base de datos
    queryClient.setQueryData(["user"], (prevData: User) => ({
      ...prevData,
      links: JSON.stringify(updatedItems),
    }));
  };

  return (
    <>
      <div className="space-y-5">
        {devTreeLinks.map((item) => (
          <DevTreeInput
            key={item.name}
            item={item}
            handleUrlChange={handleUrlChange}
            handleEnableLink={handleEnableLink}
          />
        ))}
        <button
          disabled={isPending}
          className={`bg-cyan-400 p-3 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer
          ${isPending ? "opacity-50" : "opacity-100"}`}
          onClick={() => mutate(queryClient.getQueryData(["user"])!)}
        >
          Guardar Cambios
        </button>
      </div>
    </>
  );
}
