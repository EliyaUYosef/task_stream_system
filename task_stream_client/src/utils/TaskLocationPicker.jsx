import React, { useEffect, useRef } from "react";

const TaskLocationPicker = ({ onLocationSelected }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null); // נשמור את האובייקט כדי למנוע כפילויות

  useEffect(() => {
    const initAutocomplete = async () => {
      // 1. טעינה אסינכרונית של הספרייה (חובה בגרסאות החדשות)
      const { Autocomplete } = await window.google.maps.importLibrary("places");

      // 2. יצירת האוטוקומפליט על האינפוט
      autocompleteRef.current = new Autocomplete(inputRef.current, {
        componentRestrictions: { country: "il" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
      });

      // 3. האזנה לבחירה
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        console.log("נבחר מקום:", place);
        onLocationSelected?.(place);
      });
    };

    if (window.google) {
      initAutocomplete();
    }
  }, [onLocationSelected]);

  return (
    <div style={{ direction: "rtl", marginBottom: "20px" }}>
      <label
        style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
      >
        מיקום המשימה:
      </label>
      <input
        ref={inputRef}
        type="text"
        placeholder="הקלד עיר או רחוב..."
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />
    </div>
  );
};

export default TaskLocationPicker;
