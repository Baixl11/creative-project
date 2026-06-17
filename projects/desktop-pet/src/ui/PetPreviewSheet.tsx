import { getPetActions } from "../pets/actions";
import { petDefinitions } from "../pets/registry";
import { defaultAppearance, PetAppearance } from "../types";
import { PetCanvas } from "../visuals/PetCanvas";

const previewPets = ["line-cat", "line-alpaca", "line-rabbit", "line-cow"];

const previewAppearance: PetAppearance = {
  ...defaultAppearance,
  lineColor: "#111827",
  lineWeight: 4.2,
  scale: 0.9,
  earStyle: "pointy",
  tailStyle: "curly",
  animationIntensity: "calm"
};

const petAppearanceOverrides: Record<string, Partial<PetAppearance>> = {
  "line-cat": {
    earStyle: "pointy",
    tailStyle: "curly",
    scale: 0.86
  },
  "line-alpaca": {
    earStyle: "pointy",
    tailStyle: "short",
    scale: 0.84
  },
  "line-rabbit": {
    earStyle: "pointy",
    tailStyle: "short",
    scale: 0.84
  },
  "line-cow": {
    earStyle: "floppy",
    tailStyle: "short",
    scale: 0.88
  }
};

export function PetPreviewSheet() {
  const pets = petDefinitions.filter((petDefinition) => previewPets.includes(petDefinition.id));

  return (
    <main className="pet-preview-sheet">
      <section className="pet-preview-hero" aria-label="宠物形象合集">
        <div>
          <p className="eyebrow">Desktop Pet Concept</p>
          <h1>宠物形象重设计效果图</h1>
        </div>
        <div className="pet-preview-lineup">
          {pets.map((petDefinition) => (
            <article className="pet-preview-lineup__item" key={petDefinition.id}>
              <PetCanvas
                selectedPetId={petDefinition.id}
                appearance={{ ...previewAppearance, ...petAppearanceOverrides[petDefinition.id] }}
                petState="happy"
              />
              <strong>{petDefinition.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="pet-preview-grid" aria-label="单个宠物效果图">
        {pets.map((petDefinition) => (
          <article className="pet-preview-card" key={petDefinition.id}>
            <div className="pet-preview-card__canvas">
              <PetCanvas
                selectedPetId={petDefinition.id}
                appearance={{ ...previewAppearance, ...petAppearanceOverrides[petDefinition.id], scale: 1.08 }}
                petState="happy"
              />
            </div>
            <div>
              <h2>{petDefinition.name}</h2>
              <p>{petDefinition.description}</p>
              <p className="pet-preview-card__actions">
                动作：{getPetActions(petDefinition.id).map((action) => action.label).join(" / ")}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
