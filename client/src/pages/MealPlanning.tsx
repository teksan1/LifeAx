import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, ShoppingCart, ChefHat, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function MealPlanning() {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    dietaryPreferences: [] as string[],
    restrictions: [] as string[],
    budget: "",
    servings: 2,
  });

  const [generateData, setGenerateData] = useState({
    dietaryPreferences: [] as string[],
    restrictions: [] as string[],
    servings: 2,
  });

  const listPlansQuery = trpc.mealPlanning.listPlans.useQuery();
  const createPlanMutation = trpc.mealPlanning.createPlan.useMutation();
  const generateMealPlanMutation = trpc.mealPlanning.generateMealPlan.useMutation();
  const getShoppingListQuery = trpc.shopping.getList.useQuery(
    { mealPlanId: selectedPlan || 0 },
    { enabled: !!selectedPlan }
  );
  const getTotalQuery = trpc.shopping.getTotal.useQuery(
    { mealPlanId: selectedPlan || 0 },
    { enabled: !!selectedPlan }
  );

  const dietaryOptions = [
    "Vegan",
    "Vegetarian",
    "Gluten-Free",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low-Carb",
    "High-Protein",
  ];

  const restrictionOptions = [
    "Dairy-Free",
    "Nut-Free",
    "Soy-Free",
    "Shellfish-Free",
    "Egg-Free",
    "Fish-Free",
  ];

  const handleCreatePlan = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createPlanMutation.mutateAsync({
        title: formData.title,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        dietaryPreferences: formData.dietaryPreferences,
        restrictions: formData.restrictions,
        budget: formData.budget ? parseInt(formData.budget) * 100 : undefined,
        servings: formData.servings,
      });

      toast.success("Meal plan created!");
      setShowCreateForm(false);
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        dietaryPreferences: [],
        restrictions: [],
        budget: "",
        servings: 2,
      });
      await listPlansQuery.refetch();
    } catch (error) {
      toast.error("Failed to create meal plan");
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      const result = await generateMealPlanMutation.mutateAsync({
        dietaryPreferences: generateData.dietaryPreferences,
        restrictions: generateData.restrictions,
        servings: generateData.servings,
      });

      toast.success("Meal plan generated!");
      setShowGenerateForm(false);
      console.log("Generated meal plan:", result);
    } catch (error) {
      toast.error("Failed to generate meal plan");
    }
  };

  const toggleDietaryPreference = (pref: string, isGenerate: boolean = false) => {
    if (isGenerate) {
      setGenerateData((prev) => ({
        ...prev,
        dietaryPreferences: prev.dietaryPreferences.includes(pref)
          ? prev.dietaryPreferences.filter((p) => p !== pref)
          : [...prev.dietaryPreferences, pref],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        dietaryPreferences: prev.dietaryPreferences.includes(pref)
          ? prev.dietaryPreferences.filter((p) => p !== pref)
          : [...prev.dietaryPreferences, pref],
      }));
    }
  };

  const toggleRestriction = (restriction: string, isGenerate: boolean = false) => {
    if (isGenerate) {
      setGenerateData((prev) => ({
        ...prev,
        restrictions: prev.restrictions.includes(restriction)
          ? prev.restrictions.filter((r) => r !== restriction)
          : [...prev.restrictions, restriction],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        restrictions: prev.restrictions.includes(restriction)
          ? prev.restrictions.filter((r) => r !== restriction)
          : [...prev.restrictions, restriction],
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-2 border-foreground bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat size={32} className="font-black" />
              <h1 className="text-3xl font-black uppercase">Meal Planning</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="border-2 border-foreground font-bold uppercase"
              >
                <Plus size={16} />
                New Plan
              </Button>
              <Button
                onClick={() => setShowGenerateForm(true)}
                className="border-2 border-foreground font-bold uppercase bg-foreground text-background"
              >
                <ChefHat size={16} />
                AI Generate
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Create personalized meal plans with AI-powered recommendations, shopping lists, and
            recipes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Meal Plans List */}
          <div className="md:col-span-1 border-2 border-foreground bg-card p-4">
            <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
              Your Plans
            </h3>

            <div className="space-y-2">
              {listPlansQuery.data?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No meal plans yet. Create one to get started!
                </p>
              ) : (
                listPlansQuery.data?.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left px-3 py-2 border-2 transition-all text-sm ${
                      selectedPlan === plan.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground hover:bg-foreground hover:text-background"
                    }`}
                  >
                    <p className="font-bold truncate">{plan.title}</p>
                    <p className="text-xs opacity-75">
                      {new Date(plan.startDate).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Plan Details */}
          <div className="md:col-span-2 space-y-4">
            {selectedPlan ? (
              <>
                {/* Meal Plan Overview */}
                <Card className="border-2 border-foreground p-6">
                  <h3 className="text-lg font-black uppercase mb-4">Plan Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-bold">7 Days</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                        Servings
                      </p>
                      <p className="text-sm font-bold">2 People</p>
                    </div>
                  </div>
                </Card>

                {/* Shopping List */}
                <Card className="border-2 border-foreground p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={20} />
                      <h3 className="text-lg font-black uppercase">Shopping List</h3>
                    </div>
                    {getTotalQuery.data && (
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase text-muted-foreground">
                          Total Cost
                        </p>
                        <p className="text-xl font-black">{getTotalQuery.data.formatted}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getShoppingListQuery.data?.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No items in shopping list
                      </p>
                    ) : (
                      getShoppingListQuery.data?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 border-2 border-foreground"
                        >
                          <Checkbox id={`item-${item.id}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                          {item.price && (
                            <p className="text-sm font-bold whitespace-nowrap">
                              ${(item.price / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-foreground flex gap-2">
                    <Button className="flex-1 border-2 border-foreground font-bold uppercase text-sm">
                      Order from Coles
                    </Button>
                    <Button className="flex-1 border-2 border-foreground font-bold uppercase text-sm bg-foreground text-background">
                      Order from Woolworths
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="border-2 border-foreground p-12 text-center">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-bold uppercase">
                  Select a meal plan to view details
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Create Plan Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-2 border-foreground p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black uppercase mb-4">Create Meal Plan</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Plan Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Weekly Meal Prep"
                    className="border-2 border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">End Date</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="border-2 border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">
                    Dietary Preferences
                  </label>
                  <div className="space-y-2">
                    {dietaryOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.dietaryPreferences.includes(option)}
                          onCheckedChange={() => toggleDietaryPreference(option)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">
                    Restrictions
                  </label>
                  <div className="space-y-2">
                    {restrictionOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.restrictions.includes(option)}
                          onCheckedChange={() => toggleRestriction(option)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Budget ($)</label>
                    <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="e.g., 100"
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Servings</label>
                    <Input
                      type="number"
                      value={formData.servings}
                      onChange={(e) =>
                        setFormData({ ...formData, servings: parseInt(e.target.value) })
                      }
                      min="1"
                      className="border-2 border-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleCreatePlan}
                  disabled={createPlanMutation.isPending}
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  {createPlanMutation.isPending ? <Loader2 className="animate-spin" /> : "Create"}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Generate Meal Plan Modal */}
        {showGenerateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-2 border-foreground p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black uppercase mb-4">AI Generate Meal Plan</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-2">
                    Dietary Preferences
                  </label>
                  <div className="space-y-2">
                    {dietaryOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={generateData.dietaryPreferences.includes(option)}
                          onCheckedChange={() => toggleDietaryPreference(option, true)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">
                    Restrictions
                  </label>
                  <div className="space-y-2">
                    {restrictionOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={generateData.restrictions.includes(option)}
                          onCheckedChange={() => toggleRestriction(option, true)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Servings</label>
                  <Input
                    type="number"
                    value={generateData.servings}
                    onChange={(e) =>
                      setGenerateData({ ...generateData, servings: parseInt(e.target.value) })
                    }
                    min="1"
                    className="border-2 border-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleGenerateMealPlan}
                  disabled={generateMealPlanMutation.isPending}
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  {generateMealPlanMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
                <Button
                  onClick={() => setShowGenerateForm(false)}
                  variant="outline"
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
