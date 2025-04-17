async function getAccessToken() {
  const clientId = "6bc309aa92094fadbaef64edcd5e4214";
  const clientSecret = "Zg3X6msjyckhcqIE2m3b3f7EDr7l5iw4";
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch("https://us.battle.net/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + credentials,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  console.log("TOKEN:", data.access_token);
  return data.access_token;
}

async function getCharacterData(realm, characterName, token) {
  const url = `https://us.api.blizzard.com/profile/wow/character/${realm}/${characterName.toLowerCase()}?namespace=profile-classic1x-us&locale=es_MX`;

  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + token);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  console.log("URL de la solicitud:", url);

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`No se pudo obtener información para ${characterName}:`, error);
    return null;
  }
}

async function getExtraData(realm, characterName, token, path) {
  const url = `https://us.api.blizzard.com/profile/wow/character/${realm}/${characterName.toLowerCase()}${path}?namespace=profile-classic1x-us&locale=es_MX`;

  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + token);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  console.log("URL de la solicitud:", url);

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`No se pudo obtener información para ${characterName}:`, error);
    return null;
  }
}

async function updateProfile(profileId, realm, characterName, token) {
  const profileDiv = document.getElementById(profileId);
  const data = await getCharacterData(realm, characterName, token);

  const imageProfile = await getExtraData(realm, characterName, token, '/character-media');
  const equipment = await getExtraData(realm, characterName, token, '/equipment');
  data.imageProfile = imageProfile.assets[0].value;

  var equipmentToFront="";
  equipment.equipped_items.forEach((item, index) => {
    
  const itemToShow = {
    "name" : item.name,
    "quality" : item.quality?.type,
    "slot" : item.slot?.name
  };
    console.log(`Ítem ${index + 1}:`);
    //equipmentToFront +='Slot: ${slot} - ${name} Calidad: ${quality}';
    equipmentToFront += `<p><span>${itemToShow.slot}: </span><span class="${itemToShow.quality}">${itemToShow.name}</span></p>\n`;

  });
  data.equipment = equipmentToFront;

  if (!data) {
    profileDiv.innerHTML = `<p>No se pudo obtener información de ${characterName}.</p>`;
    return;
  }

  profileDiv.innerHTML = `
    <p><strong></strong><br><img src="${data.imageProfile || 'default-avatar.png'}" alt="Retrato de ${data.name}"></p>
    <p><strong>Nombre:</strong> ${data.name}</p>
    <p><strong>Nivel:</strong> ${data.level}</p>
    <p><strong> Clase:</strong> <span class=${data.character_class.name} > ${data.character_class.name}</span></p>
    <p><strong>Raza:</strong> ${data.race.name}</p>
    <p><strong>Equipamiento:</strong></p> ${data.equipment}
    
  

  `;
}

async function updateParty() {
  const token = await getAccessToken();
  updateProfile("perfil-muztu", "skull-rock", "Muztu", token);
  updateProfile("perfil-gryshka", "skull-rock", "Gryshka", token);
  updateProfile("perfil-quraplus", "skull-rock", "Quraplus", token);
  updateProfile("perfil-morwyn", "skull-rock", "Morwyn", token);
  updateProfile("perfil-giorgio", "skull-rock", "Giorgio", token);
}

window.onload = function () {
  updateParty();
  setInterval(updateParty, 300000); // cada 5 minutos
};