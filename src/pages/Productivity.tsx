import { Calendar, CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const tasks = [
  { id: 1, title: "Finaliser présentation client", priority: "high", completed: false },
  { id: 2, title: "Réviser contrat partenariat", priority: "medium", completed: false },
  { id: 3, title: "Envoyer facture Projet X", priority: "high", completed: false },
  { id: 4, title: "Appel avec agent NARA", priority: "low", completed: true },
];

const upcomingTasks = [
  { id: 5, title: "Réunion stratégie Q2", date: "Demain, 14h00" },
  { id: 6, title: "Deadline Projet Y", date: "25 Jan 2024" },
  { id: 7, title: "Formation comptabilité", date: "28 Jan 2024" },
];

const Productivity = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      default:
        return "bg-foreground/10 text-foreground border-foreground/20";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Votre Journée
          </h1>
          <p className="text-foreground/60 mt-2">
            Organisation et collaboration simplifiées
          </p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Ajouter une tâche
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gold" />
              À faire aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(t => !t.completed).length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/60">Aucune tâche pour aujourd'hui</p>
              </div>
            ) : (
              tasks
                .filter((task) => !task.completed)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <Checkbox id={`task-${task.id}`} />
                    <label
                      htmlFor={`task-${task.id}`}
                      className="flex-1 cursor-pointer text-sm font-medium text-foreground"
                    >
                      {task.title}
                    </label>
                    <span
                      className={`text-xs px-2 py-1 rounded border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority === "high"
                        ? "Urgent"
                        : task.priority === "medium"
                        ? "Important"
                        : "Normal"}
                    </span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Calendar / Upcoming */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              À venir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-start gap-4 py-3 ${
                  index !== upcomingTasks.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-foreground/60 mt-1">{task.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Completed Tasks */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold">Terminées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks
            .filter((task) => task.completed)
            .map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/20"
              >
                <Checkbox id={`task-${task.id}`} checked disabled />
                <label
                  htmlFor={`task-${task.id}`}
                  className="flex-1 text-sm text-foreground/60 line-through"
                >
                  {task.title}
                </label>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Productivity;
