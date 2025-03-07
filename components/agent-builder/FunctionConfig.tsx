import React, { useContext, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { FunctionContext } from "../../contexts/FunctionContext";

interface FunctionConfigProps {
  func: {
    id: string;
    name: string;
    description: string;
    functionName?: string; // Optional in case these are not always provided
    functionParameters?: string;
  };
  onRemove: (id: string) => void;
}

const FunctionConfig: React.FC<FunctionConfigProps> = ({ func, onRemove }) => {
  const [customName, setCustomName] = useState(func.functionName || "");
  const [parameters, setParameters] = useState(func.functionParameters || "");
  const [name, setName] = useState(func.name || "");

  const [errors, setErrors] = useState({
    customName: "",
    parameters: "",
  });
  const [isSaved, setIsSaved] = useState(false);

  // Access context values
  const functionContext = useContext(FunctionContext);

  // Handle missing context
  if (!functionContext) {
    throw new Error("FunctionConfig must be used within a FunctionProvider");
  }

  const { functionMappings, setFunctionMappings } = functionContext;

  // Update customName and parameters when the func object changes
  useEffect(() => {
    if (func.functionName) {
      setCustomName(func.functionName);
    }
    if (func.functionParameters) {
      setParameters(func.functionParameters);
    }
    if (func.name) {
      setName(func.name);
    }
  }, [func]);

  // Handle save functionality
  const handleSave = () => {
    // Validate fields
    const newErrors = {
      customName: customName.trim() ? "" : "Function name is required.",
      parameters: parameters.trim() ? "" : "Parameters are required.",
    };
    setErrors(newErrors);

    // Check for errors
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    // Update the functionMappings object with the new customName, parameters, and title
    setFunctionMappings((prevMappings: Record<string, any>) => ({
      ...prevMappings,
      [func.name]: {
        title: customName,
        parameters: parameters,
      },
    }));

    // Show feedback on the save button
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Revert the button text after 2 seconds
  };

  return (
    <div className="border rounded-lg bg-inputbg">
      <div className="border-b-2 border-[#232323] px-4 py-2 flex justify-between">
      <h3 className="font-semibold text-lg">{name || func.name }</h3>
        <Trash2 className="cursor-pointer h-5 w-5" onClick={() => onRemove(func.id)} />
      </div>

      <div className="py-2 px-4">
        <p className="text-gray-400 ">Configuration</p>
        <label className="block text-sm my-2">Function Name</label>
        <input
          type="text"
          value={customName}
          onChange={(e) => {
            setCustomName(e.target.value);
            if (e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, customName: "" }));
            }
          }}
          placeholder="Custom name for this function"
          className="focus:outline-none rounded-md w-full p-2 bg-[#242424]"
        />
        {errors.customName && <p className="text-red-500 text-sm mt-1">{errors.customName}</p>}
      </div>

      <div className="p-4">
        <label className="block text-sm mb-2">Parameters</label>
        <textarea
          value={parameters}
          onChange={(e) => {
            setParameters(e.target.value);
            if (e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, parameters: "" }));
            }
          }}
          placeholder="Configure function parameters..."
          className="focus:outline-none rounded-md bg-[#242424] w-full p-2 h-24"
        />
        {errors.parameters && <p className="text-red-500 text-sm mt-1">{errors.parameters}</p>}
      </div>

      {/* Save button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
          disabled={isSaved} // Disable button temporarily when showing "Saved!"
        >
          {isSaved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default FunctionConfig;
