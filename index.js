import express from "express";

const app = express();
app.use(express.json());


// DADOS

let pets = [
  {
    idPet: 1,
    dsNome: "Thor",
    dsEspecie: "cachorro",
    nuIdade: 3,
    fgAdotado: false,
  },
  {
    idPet: 2,
    dsNome: "Beijamin",
    dsEspecie: "gato",
    nuIdade: 1.5,
    fgAdotado: false,
  },
  {
    idPet: 3,
    dsNome: "Bob",
    dsEspecie: "Tartaruga",
    nuIdade: 0.5,
    fgAdotado: false,
  },
];

// ultimo id usado (o maior id inicial do array)

let ultimoId = 3;

// FUNCOES (nao usam req nem res)

function findAll() {
  return pets;
}

function findOne(id) {
  return pets.find((pet) => {
    return pet.idPet === id;
  });
}

function criarPet(nome, especie, idade) {
  ultimoId++;

  let novo_pet = {
    idPet: ultimoId,
    dsNome: nome,
    dsEspecie: especie,
    nuIdade: idade,
    fgAdotado: false,
  };

  pets.push(novo_pet);
  return novo_pet;
}

function editarPet(id, alteracoes) {
  let pet = findOne(id);

  if (!pet) {
    return null;
  }

  // idPet nunca esta em "alteracoes", entao nunca e alterado
  Object.assign(pet, alteracoes);
  return pet;
}

function deletarPet(id) {
  let index_pet = pets.findIndex((pet) => {
    return pet.idPet === id;
  });

  if (index_pet === -1) {
    return false;
  }

  pets.splice(index_pet, 1);
  return true;
}

// funcoes auxiliares de validacao
function textoValido(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

function idadeValida(valor) {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0;
}


// ROTAS

app.get("/pets", (req, res) => {
  return res.status(200).json(findAll());
});

app.get("/pets/:id", (req, res) => {
  const idPet = parseInt(req.params.id);

  if (isNaN(idPet)) {
    return res.status(400).json({ mensagem: "identificador deve ser um numero" });
  }

  let pet = findOne(idPet);

  if (!pet) {
    return res.status(404).send();
  }

  return res.status(200).json(pet);
});

app.post("/pets", (req, res) => {
  const { dsNome, dsEspecie, nuIdade } = req.body ?? {};

  if (!textoValido(dsNome) || !textoValido(dsEspecie)) {
    return res
      .status(400)
      .json({ mensagem: "dsNome e dsEspecie sao obrigatorios e nao podem ser vazios" });
  }

  if (!idadeValida(nuIdade)) {
    return res
      .status(400)
      .json({ mensagem: "nuIdade e obrigatorio e deve ser um numero maior ou igual a 0" });
  }

  let pet_criado = criarPet(dsNome, dsEspecie, nuIdade);

  return res.status(201).json(pet_criado);
});

app.patch("/pets/:id", (req, res) => {
  const idPet = parseInt(req.params.id);

  // 1. valida o id
  if (isNaN(idPet)) {
    return res.status(400).json({ mensagem: "identificador deve ser um numero" });
  }

  // 2. verifica se o pet existe
  if (!findOne(idPet)) {
    return res.status(404).send();
  }

  // 3. valida o conteudo do body
  const { dsNome, dsEspecie, nuIdade, fgAdotado } = req.body ?? {};
  let alteracoes = {};

  if (dsNome !== undefined) {
    if (!textoValido(dsNome)) {
      return res.status(400).json({ mensagem: "dsNome nao pode ser vazio" });
    }
    alteracoes.dsNome = dsNome;
  }

  if (dsEspecie !== undefined) {
    if (!textoValido(dsEspecie)) {
      return res.status(400).json({ mensagem: "dsEspecie nao pode ser vazio" });
    }
    alteracoes.dsEspecie = dsEspecie;
  }

  if (nuIdade !== undefined) {
    if (!idadeValida(nuIdade)) {
      return res
        .status(400)
        .json({ mensagem: "nuIdade deve ser um numero maior ou igual a 0" });
    }
    alteracoes.nuIdade = nuIdade;
  }

  if (fgAdotado !== undefined) {
    if (typeof fgAdotado !== "boolean") {
      return res.status(400).json({ mensagem: "fgAdotado deve ser true ou false" });
    }
    alteracoes.fgAdotado = fgAdotado;
  }

  // nenhum campo valido enviado
  if (Object.keys(alteracoes).length === 0) {
    return res.status(400).json({
      mensagem: "envie ao menos um campo: dsNome, dsEspecie, nuIdade ou fgAdotado",
    });
  }

  // so chega aqui se tudo estiver valido, entao nada e alterado pela metade
  let pet_editado = editarPet(idPet, alteracoes);

  return res.status(200).json(pet_editado);
});

app.delete("/pets/:id", (req, res) => {
  const idPet = parseInt(req.params.id);

  if (isNaN(idPet)) {
    return res.status(400).json({ mensagem: "identificador deve ser um numero" });
  }

  if (!findOne(idPet)) {
    return res.status(404).send();
  }

  deletarPet(idPet);

  return res.status(204).send();
});

// ---------------------------------------------------------------
app.listen(3001, () => {
  console.log("API rodando na porta 3000");
});