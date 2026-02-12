"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Comunidade {
  id: number;
  nome: string;
  grupo: string;
}

interface Jogador {
  id: number;
  nome: string;
  numero_camisola?: number;
  posicao?: string;
  comunidade_id: number;
  comunidades?: { nome: string };
}

interface Partida {
  casa_id: string;
  fora_id: string;
  golos_casa: number;
  golos_fora: number;
  jornada: number;
}

interface GoloRegisto {
  jogador_id: string;
  assistencia_id: string;
  minuto: string;
}

export default function CampeonatoOAC() {
  const [activeTab, setActiveTab] = useState("registar");
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [partida, setPartida] = useState<Partida>({
    casa_id: "",
    fora_id: "",
    golos_casa: 0,
    golos_fora: 0,
    jornada: 2,
  });

  const [golos, setGolos] = useState<GoloRegisto[]>([
    { jogador_id: "", assistencia_id: "", minuto: "" },
  ]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    await Promise.all([carregarComunidades(), carregarJogadores()]);
    setLoading(false);
  }

  async function carregarComunidades() {
    const { data } = await supabase
      .from("comunidades")
      .select("*")
      .order("nome");
    setComunidades(data || []);
  }

  async function carregarJogadores() {
    const { data } = await supabase
      .from("jogadores")
      .select("*, comunidades(nome)")
      .eq("is_staff", false);
    setJogadores(data || []);
  }

  function adicionarGolo() {
    setGolos([...golos, { jogador_id: "", assistencia_id: "", minuto: "" }]);
  }

  function atualizarGolo(index: number, campo: string, valor: string) {
    const novosGolos = [...golos];
    novosGolos[index] = { ...novosGolos[index], [campo]: valor };
    setGolos(novosGolos);
  }

  async function registarPartida() {
    if (!partida.casa_id || !partida.fora_id) {
      setMensagem("❌ Seleciona as duas equipas!");
      return;
    }

    try {
      const { data: partidaData, error: erroPartida } = await supabase
        .from("partidas")
        .insert([
          {
            casa_comunidade_id: parseInt(partida.casa_id),
            fora_comunidade_id: parseInt(partida.fora_id),
            golos_casa: partida.golos_casa,
            golos_fora: partida.golos_fora,
            jornada: partida.jornada,
          },
        ])
        .select()
        .single();

      if (erroPartida) throw erroPartida;

      for (const golo of golos) {
        if (golo.jogador_id) {
          await supabase.from("golos").insert({
            partida_id: partidaData.id,
            jogador_id: parseInt(golo.jogador_id),
            assistencia_jogador_id: golo.assistencia_id
              ? parseInt(golo.assistencia_id)
              : null,
            minuto: golo.minuto ? parseInt(golo.minuto) : null,
          });
        }
      }

      setMensagem("✅ Jogo registado com sucesso!");
      setPartida({
        casa_id: "",
        fora_id: "",
        golos_casa: 0,
        golos_fora: 0,
        jornada: 2,
      });
      setGolos([{ jogador_id: "", assistencia_id: "", minuto: "" }]);
    } catch (error) {
      console.error(error);
      setMensagem("❌ Erro ao registar jogo!");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="text-6xl animate-bounce mb-4">⚽</div>
          <div className="w-16 h-16 border-4 border-[#1B5E3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            A carregar campeonato da OAC...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#667eea] to-[#764ba2] p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SOFASCORE STYLE */}
        <div className="glass-card p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#1B5E3A] rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">⚽</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    OAC Maputo
                  </h1>
                  <p className="text-gray-500">Super Taça Jovem • Jornada 2</p>
                </div>
              </div>
            </div>
            <div className="bg-[#1B5E3A] text-white px-4 py-2 rounded-full text-sm font-semibold">
              ⚡ Ao Vivo
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="stat-card">
              <div className="text-3xl font-bold text-[#1B5E3A]">
                {comunidades.length}
              </div>
              <div className="text-sm text-gray-500">Equipas</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-[#1B5E3A]">
                {jogadores.length}
              </div>
              <div className="text-sm text-gray-500">Jogadores</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-[#1B5E3A]">4</div>
              <div className="text-sm text-gray-500">Grupos</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold text-[#FFB300]">2</div>
              <div className="text-sm text-gray-500">Jornada</div>
            </div>
          </div>

          {/* GRUPOS BADGES */}
          <div className="flex gap-2 mt-4">
            <span className="badge-grupo badge-grupo-a">
              Grupo A • 4 equipas
            </span>
            <span className="badge-grupo badge-grupo-b">
              Grupo B • 4 equipas
            </span>
            <span className="badge-grupo badge-grupo-c">
              Grupo C • 4 equipas
            </span>
            <span className="badge-grupo badge-grupo-d">
              Grupo D • 4 equipas
            </span>
          </div>
        </div>

        {/* TABS SOFASCORE STYLE */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("registar")}
              className={
                activeTab === "registar" ? "tab-active" : "tab-inactive"
              }
            >
              📝 Registar Jogo
            </button>
            <button
              onClick={() => setActiveTab("marcadores")}
              className={
                activeTab === "marcadores" ? "tab-active" : "tab-inactive"
              }
            >
              ⚡ Melhores Marcadores
            </button>
            <button
              onClick={() => setActiveTab("assistencias")}
              className={
                activeTab === "assistencias" ? "tab-active" : "tab-inactive"
              }
            >
              🎯 Melhores Assistentes
            </button>
            <button
              onClick={() => setActiveTab("classificacao")}
              className={
                activeTab === "classificacao" ? "tab-active" : "tab-inactive"
              }
            >
              🏆 Classificação
            </button>
          </div>
        </div>

        {/* MENSAGEM FEEDBACK */}
        {mensagem && (
          <div className="glass-card p-4 mb-6 border-l-4 border-[#1B5E3A]">
            <p className="text-gray-700">{mensagem}</p>
          </div>
        )}

        {/* CONTEÚDO DAS TABS */}
        <div className="glass-card p-8">
          {activeTab === "registar" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#1B5E3A] rounded-full"></span>
                Registar Resultado
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Equipa Casa
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E3A] focus:border-transparent"
                    value={partida.casa_id}
                    onChange={(e) =>
                      setPartida({ ...partida, casa_id: e.target.value })
                    }
                  >
                    <option value="">Selecionar equipa</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.grupo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Equipa Visitante
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E3A] focus:border-transparent"
                    value={partida.fora_id}
                    onChange={(e) =>
                      setPartida({ ...partida, fora_id: e.target.value })
                    }
                  >
                    <option value="">Selecionar equipa</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.grupo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Golos Casa
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E3A]"
                    value={partida.golos_casa}
                    onChange={(e) =>
                      setPartida({
                        ...partida,
                        golos_casa: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Golos Fora
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E3A]"
                    value={partida.golos_fora}
                    onChange={(e) =>
                      setPartida({
                        ...partida,
                        golos_fora: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ⚽ Golos da Partida
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-3 gap-4 mb-2 text-sm font-semibold text-gray-600">
                    <div>Jogador</div>
                    <div>Assistência</div>
                    <div>Minuto</div>
                  </div>

                  {golos.map((golo, index) => {
                    const jogadoresPartida = jogadores.filter(
                      (j) =>
                        j.comunidade_id === parseInt(partida.casa_id) ||
                        j.comunidade_id === parseInt(partida.fora_id),
                    );

                    return (
                      <div key={index} className="grid grid-cols-3 gap-4 mb-3">
                        <select
                          className="p-2 border border-gray-200 rounded-lg text-sm"
                          value={golo.jogador_id}
                          onChange={(e) =>
                            atualizarGolo(index, "jogador_id", e.target.value)
                          }
                        >
                          <option value="">-- Marcar --</option>
                          {jogadoresPartida.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.nome}
                            </option>
                          ))}
                        </select>
                        <select
                          className="p-2 border border-gray-200 rounded-lg text-sm"
                          value={golo.assistencia_id}
                          onChange={(e) =>
                            atualizarGolo(
                              index,
                              "assistencia_id",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">-- Assistência --</option>
                          <option value="">Sem assistência</option>
                          {jogadoresPartida.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.nome}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="p-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="min"
                          value={golo.minuto}
                          onChange={(e) =>
                            atualizarGolo(index, "minuto", e.target.value)
                          }
                        />
                      </div>
                    );
                  })}

                  <button
                    onClick={adicionarGolo}
                    className="text-[#1B5E3A] text-sm font-semibold hover:text-[#2E7D32] mt-2 flex items-center gap-1"
                  >
                    <span className="text-lg">+</span> Adicionar mais golo
                  </button>
                </div>
              </div>

              <button
                onClick={registarPartida}
                className="w-full bg-linear-to-r from-[#1B5E3A] to-[#2E7D32] text-white py-4 rounded-xl font-bold hover:from-[#2E7D32] hover:to-[#1B5E3A] transition-all shadow-lg"
              >
                ✅ SALVAR JOGO E ACTUALIZAR CLASSIFICAÇÃO
              </button>
            </div>
          )}

          {activeTab === "marcadores" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#FFB300] rounded-full"></span>
                Melhores Marcadores
              </h2>
              <div className="bg-linear-to-r from-[#FFF9E6] to-white rounded-xl p-6">
                <p className="text-center text-gray-500 py-8">
                  🔄 Estatísticas disponíveis após os primeiros jogos...
                </p>
              </div>
            </div>
          )}

          {activeTab === "assistencias" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#FFB300] rounded-full"></span>
                Melhores Assistentes
              </h2>
              <div className="bg-linear-to-r from-[#FFF9E6] to-white rounded-xl p-6">
                <p className="text-center text-gray-500 py-8">
                  🔄 Estatísticas disponíveis após os primeiros jogos...
                </p>
              </div>
            </div>
          )}

          {activeTab === "classificacao" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#1B5E3A] rounded-full"></span>
                Classificação
              </h2>
              <div className="space-y-6">
                {["A", "B", "C", "D"].map((grupo) => (
                  <div key={grupo} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`badge-grupo badge-grupo-${grupo.toLowerCase()}`}
                      >
                        Grupo {grupo}
                      </span>
                    </div>
                    <p className="text-center text-gray-500 py-4">
                      🔄 Jogos em andamento...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-white/80 text-xs">
          <p>🇲🇿 OAC Maputo • Sistema de Gestão de Campeonato</p>
          <p className="mt-1">
            {comunidades.length} equipas • {jogadores.length} jogadores • Super
            Taça Jovem 2026
          </p>
        </div>
      </div>
    </div>
  );
}
