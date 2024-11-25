import { describe, it, expect, beforeEach, vi } from "vitest";
import { PokemonService } from "~/services/PokemonService";
import { PokeApiClient } from "~/services/PokeApiClient";
import { Pokemon } from "~/services/pokemon";

describe("PokemonService and PokeApiClient", () => {
  let pokemonService: PokemonService;
  let pokeApiClientMock: PokeApiClient;

  beforeEach(() => {
    pokeApiClientMock = {
      getPokemonList: vi.fn(),
    } as unknown as PokeApiClient;

    pokemonService = new PokemonService(pokeApiClientMock);
  });

  describe("PokeApiClient.getPokemonList", () => {
    it("should return a list of Pokemon", async () => {
      const mockPokemonList: Pokemon[] = [
        { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] },
        { id: 2, name: "Charmander", sprite: "charmander.png", types: ["Fire"] },
      ];
      (pokeApiClientMock.getPokemonList as vi.Mock).mockResolvedValue(mockPokemonList);

      const result = await pokemonService.getPokemonList();

      expect(pokeApiClientMock.getPokemonList).toHaveBeenCalled();
      expect(result).toEqual(mockPokemonList);
    });

    it("should throw an error if the API call fails", async () => {
      const errorMessage = "API Error";
      (pokeApiClientMock.getPokemonList as vi.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(pokemonService.getPokemonList()).rejects.toThrow(errorMessage);
    });
  });

  describe("PokemonService.userTeams", () => {
    it("should return an empty team if no team exists for a user", () => {
      const userId = "user1";

      const result = pokemonService.getUserTeam(userId);

      expect(result).toEqual([]);
    });

    it("should add a Pokemon to a user's team", () => {
      const userId = "user1";
      const pokemon: Pokemon = { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] };

      const result = pokemonService.togglePokemonInTeam(userId, pokemon);
      const team = pokemonService.getUserTeam(userId);

      expect(result).toBe(true);
      expect(team).toEqual([pokemon]);
    });

    it("should remove a Pokemon from a user's team", () => {
      const userId = "user1";
      const pokemon: Pokemon = { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] };
      (pokemonService as any).userTeams.set(userId, [pokemon]);

      const result = pokemonService.togglePokemonInTeam(userId, pokemon);
      const team = pokemonService.getUserTeam(userId);
      
      expect(result).toBe(true);
      expect(team).toEqual([]);
    });

    it("should not add a Pokemon if the team already has six members", () => {
      const userId = "user1";
      const team: Pokemon[] = [
        { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] },
        { id: 2, name: "Charmander", sprite: "charmander.png", types: ["Fire"] },
        { id: 3, name: "Squirtle", sprite: "squirtle.png", types: ["Water"] },
        { id: 4, name: "Pikachu", sprite: "pikachu.png", types: ["Electric"] },
        { id: 5, name: "Eevee", sprite: "eevee.png", types: ["Normal"] },
        { id: 6, name: "Snorlax", sprite: "snorlax.png", types: ["Normal"] },
      ];
      const newPokemon: Pokemon = { id: 7, name: "Mewtwo", sprite: "mewtwo.png", types: ["Psychic"] };
      (pokemonService as any).userTeams.set(userId, team);

      const result = pokemonService.togglePokemonInTeam(userId, newPokemon);
      const updatedTeam = pokemonService.getUserTeam(userId);

      expect(result).toBe(false);
      expect(updatedTeam).toEqual(team);
    });

    it("should clear a user's team", () => {
      const userId = "user1";
      const mockTeam: Pokemon[] = [
        { id: 1, name: "Bulbasaur", sprite: "bulbasaur.png", types: ["Grass", "Poison"] },
      ];
      (pokemonService as any).userTeams.set(userId, mockTeam);

      pokemonService.clearTeam(userId);
      const result = pokemonService.getUserTeam(userId);

      expect(result).toEqual([]);
    });
  });
});
