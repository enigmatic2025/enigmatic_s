import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, FileText, CheckSquare, Calendar, Type } from 'lucide-react';

interface SchemaField {
  key: string;
  type: 'text' | 'long-text' | 'number' | 'rating' | 'boolean' | 'date' | 'file' | 'multi-choice';
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // For multi-choice
}

interface HumanTaskConfigProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function HumanTaskConfig({ data, onUpdate }: HumanTaskConfigProps) {
  const currentConfig = data || {};
  const schema = (currentConfig.schema || []) as SchemaField[];

  const addField = () => {
    const newField: SchemaField = {
      key: `field_${schema.length + 1}`,
      type: 'text',
      label: 'New Question',
      required: true
    };
    onUpdate({ ...currentConfig, schema: [...schema, newField] });
  };

  const removeField = (index: number) => {
    const newSchema = [...schema];
    newSchema.splice(index, 1);
    onUpdate({ ...currentConfig, schema: newSchema });
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    onUpdate({ ...currentConfig, schema: newSchema });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Action Title <span className="text-red-500">*</span></Label>
          <Input 
            value={currentConfig.title || ''} 
            onChange={(e) => onUpdate({ ...currentConfig, title: e.target.value })}
            placeholder="e.g. Review {{ steps.trigger.data.name }}"
          />
          <p className="text-[11px] text-muted-foreground">The name of the task shown to the assignee. Supports variables.</p>
        </div>

        <div className="space-y-2">
          <Label>Assignee (Email or Role) <span className="text-red-500">*</span></Label>
          <Input 
            value={currentConfig.assignee || ''} 
            onChange={(e) => onUpdate({ ...currentConfig, assignee: e.target.value })}
            placeholder="e.g. {{ trigger.email }} or finance-team"
          />
        </div>
      </div>

      <hr className="my-6 border-muted" />

      {/* Required Information (Schema) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Required Info</h3>
          <Button variant="outline" size="sm" onClick={addField} className="h-7 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
          </Button>
        </div>

        <div className="space-y-3">
          {schema.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg text-sm text-muted-foreground">
              No fields defined. The AI will just ask for confirmation.
            </div>
          )}

          {schema.map((field, index) => (
            <div key={index} className="group relative border rounded-lg p-3 space-y-3 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-2.5 text-muted-foreground/50 cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1 space-y-3">
                  {/* Row 1: Label & Type & Delete */}
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input 
                        value={field.label} 
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                          
                          // Auto-generate key if it matches the previous slug or is default/empty
                          // We check if current key is a slug of the current label (before update)
                          const currentSlug = slugify(field.label);
                          const isAutoKey = field.key === currentSlug || field.key.startsWith('field_') || field.key === '';
                          
                          const updates: Partial<SchemaField> = { label: newLabel };
                          if (isAutoKey) {
                             updates.key = slugify(newLabel);
                          }
                          updateField(index, updates);
                        }}
                        placeholder="Field Label (Question)"
                        className="h-8 text-sm font-medium border-transparent bg-transparent hover:bg-background hover:border-input focus:bg-background focus:border-input px-2 -ml-2 transition-all" 
                      />
                    </div>
                    <Select 
                      value={field.type} 
                      onValueChange={(val: any) => updateField(index, { type: val })}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text"><div className="flex items-center gap-2"><Type className="w-3 h-3"/> Short Text</div></SelectItem>
                        <SelectItem value="long-text"><div className="flex items-center gap-2"><FileText className="w-3 h-3"/> Long Text</div></SelectItem>
                        <SelectItem value="number"><div className="flex items-center gap-2"><span className="font-mono text-[10px]">123</span> Number</div></SelectItem>
                        <SelectItem value="multi-choice"><div className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> Multiple Choice</div></SelectItem>
                        <SelectItem value="rating"><div className="flex items-center gap-2"><span className="font-mono text-[10px]">★</span> Rating (1-5)</div></SelectItem>
                        <SelectItem value="boolean"><div className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> Yes/No</div></SelectItem>
                        <SelectItem value="file"><div className="flex items-center gap-2"><FileText className="w-3 h-3"/> File</div></SelectItem>
                        <SelectItem value="date"><div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> Date</div></SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeField(index)}
                      title="Remove Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Options Editor for Multi-Choice */}
                  {field.type === 'multi-choice' && (
                      <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Choices</Label>
                          <div className="grid grid-cols-1 gap-2">
                              {(field.options || []).map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2 items-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                      <Input 
                                          value={option}
                                          onChange={(e) => {
                                              const newOptions = [...(field.options || [])];
                                              newOptions[optIndex] = e.target.value;
                                              updateField(index, { options: newOptions });
                                          }}
                                          placeholder={`Choice ${optIndex + 1}`}
                                          className="h-7 text-xs"
                                      />
                                      <Button
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                          onClick={() => {
                                              const newOptions = [...(field.options || [])];
                                              newOptions.splice(optIndex, 1);
                                              updateField(index, { options: newOptions });
                                          }}
                                      >
                                          <Trash2 className="w-3 h-3" />
                                      </Button>
                                  </div>
                              ))}
                              <Button
                                  variant="ghost" 
                                  size="sm"
                                  className="justify-start h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 w-fit px-2"
                                  onClick={() => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions.push(`Choice ${newOptions.length + 1}`);
                                      updateField(index, { options: newOptions });
                                  }}
                              >
                                  <Plus className="w-3 h-3 mr-1" /> Add Option
                              </Button>
                          </div>
                      </div>
                  )}

                  {/* Row 2: Key & Required */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 bg-background border rounded px-2 py-1 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                      <span className="text-muted-foreground font-mono select-none">key:</span>
                      <input 
                        className="bg-transparent border-none outline-none w-full font-mono text-foreground placeholder:text-muted-foreground/30"
                        value={field.key}
                        onChange={(e) => {
                             // Enforce strict slug format (lower_snake_case)
                             const validKey = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                             updateField(index, { key: validKey });
                        }}
                        placeholder="variable_name"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1.5 pl-2 border-l">
                      <Switch 
                        checked={field.required} 
                        onCheckedChange={(checked) => updateField(index, { required: checked })}
                        className="scale-75"
                      />
                      <span className="text-muted-foreground whitespace-nowrap">Required</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
