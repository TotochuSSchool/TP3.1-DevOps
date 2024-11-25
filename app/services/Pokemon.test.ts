import { describe, it, expect, beforeEach, vi } from "vitest";
import { PokemonService } from "~/services/PokemonService";
import { PokeApiClient } from "~/services/PokeApiClient";
import { Pokemon } from "~/services/pokemon";

describe("PokemonService", () => {
  let pokemonService: PokemonService;
  let pokeApiClientMock: PokeApiClient;

  beforeEach(() => {
    pokeApiClientMock = {
      getPokemonList: vi.fn(),
    } as unknown as PokeApiClient;

    pokemonService = new PokemonService(pokeApiClientMock);
  });

  it("should_clear_user_team", () => {
    const userId = "user1";
    const mockTeam: Pokemon[] = [{ id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] }];

    // Utilisation du cast pour accéder à userTeams
    const userTeams = (pokemonService as unknown as { userTeams: Map<string, Pokemon[]> }).userTeams;
    userTeams.set(userId, mockTeam);

    pokemonService.clearTeam(userId);
    const result = pokemonService.getUserTeam(userId);

    expect(result).toEqual([]);
  });

  it("should_remove_pokemon_from_user_team_if_present", () => {
    const userId = "user1";
    const pokemon: Pokemon = { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] };

    // Utilisation du cast pour accéder à userTeams
    const userTeams = (pokemonService as unknown as { userTeams: Map<string, Pokemon[]> }).userTeams;
    userTeams.set(userId, [pokemon]);

    const result = pokemonService.togglePokemonInTeam(userId, pokemon);
    const team = pokemonService.getUserTeam(userId);

    expect(result).toBe(true);
    expect(team).toEqual([]);
  });

  it("should_not_add_pokemon_if_team_has_six_pokemon", () => {
    const userId = "user1";
    const team: Pokemon[] = [
      { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] },
      { id: 2, name: "Charmander", sprite: "charmander.png", types: ["Fire"] },
      { id: 3, name: "Squirtle", sprite: "squirtle.png", types: ["Water"] },
      { id: 4, name: "Pikachu", sprite: "pikachu.png", types: ["Electric"] },
      { id: 5, name: "Eevee", sprite: "evee.png", types: ["Normal"] },
      { id: 6, name: "Snorlax", sprite: "snorlax.png", types: ["Normal"] },
    ];
    const newPokemon: Pokemon = { id: 7, name: "Mewtwo", sprite: "mewtwo.png", types: ["Psychic"] };

    // Utilisation du cast pour accéder à userTeams
    const userTeams = (pokemonService as unknown as { userTeams: Map<string, Pokemon[]> }).userTeams;
    userTeams.set(userId, team);

    const result = pokemonService.togglePokemonInTeam(userId, newPokemon);
    const updatedTeam = pokemonService.getUserTeam(userId);

    expect(result).toBe(false);
    expect(updatedTeam).toEqual(team);
  });
});
