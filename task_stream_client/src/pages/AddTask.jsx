import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import Style from "./addTask.module.css";
import TaskLocationPicker from "../utils/TaskLocationPicker.jsx";

export default function AddTask() {
  const locationRef = useRef(null);
  const handleSelect = (place) => {
    console.log("הכתובת שנבחרה:", place.formattedAddress);

    // setTaskLocation(place.formattedAddress);
  };
  useEffect(() => {
    if (!window.google || !locationRef.current) return;
  }, []);

  return (
    <div
      dir="rtl"
      className={Style.addTaskContainer}
    >
      <h1>משימה חדשה</h1>
      <form className={Style.addTaskForm}>
        {/* Title */}
        <div className={Style.formGroup}>
          <label htmlFor="title">כותרת המשימה</label>
          <input
            id="title"
            name="title"
            type="text"
            className={Style.formInput}
            placeholder="לדוגמה: להתקשר לשוש"
            required
          />
        </div>

        {/* Description */}
        <div className={Style.formGroup}>
          <label htmlFor="description">תיאור</label>
          <textarea
            id="description"
            name="description"
            className={Style.formTextarea}
            placeholder="פרטים נוספים על המשימה"
            rows={3}
          />
        </div>

        {/* Priority */}
        <div className={Style.formGroup}>
          <label htmlFor="priority">עדיפות</label>
          <select
            id="priority"
            name="priority"
            className={Style.formSelect}
          >
            <option value="3">&#9733;&#9733;&#9733;</option>
            <option value="1">&#9733;</option>
            <option value="2">&#9733;&#9733;</option>
            <option value="4">&#9733;&#9733;&#9733;&#9733;</option>
            <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733;</option>
          </select>
        </div>

        {/* Category */}
        <div className={Style.formGroup}>
          <label htmlFor="category">קטגוריה</label>
          <select
            name="category"
            className={Style.formSelect}
          >
            <option value="other">אחר</option>
            <option value="work">עבודה</option>
            <option value="family">משפחה</option>
            <option value="friends">חברים</option>
            <option value="lifestyle">לייף סטייל</option>
          </select>
          <input
            id="category"
            name="category"
            type="text"
            className={Style.formInput}
            placeholder="עבודה / אישי / קניות"
          />
        </div>

        {/* Raw time expression */}
        <div className={Style.formGroup}>
          <label htmlFor="raw_time_expression">זמן התחלה</label>
          <input
            id="raw_time_expression"
            name="raw_time_expression"
            type="datetime-local"
            className={Style.formDateInput}
            placeholder="2025-01-15 18:00"
          />
        </div>

        {/* Deadline expression */}
        <div className={Style.formGroup}>
          <label htmlFor="deadline_expression">דדליין מפורש</label>
          <input
            id="deadline_expression"
            name="deadline_expression"
            type="datetime-local"
            className={Style.formDateInput}
            placeholder="2025-01-15 18:00"
          />
        </div>

        {/* Estimated duration */}
        <div className={Style.formGroup}>
          <label htmlFor="estimated_duration_min">הערכת זמן (בדקות)</label>
          <input
            id="estimated_duration_min"
            name="estimated_duration_min"
            type="number"
            min="1"
            className={Style.formInput}
            placeholder="30"
          />
        </div>

        {/* Contact person */}
        <div className={Style.formGroup}>
          <label htmlFor="contact_person">איש קשר</label>
          <input
            id="contact_person"
            name="contact_person"
            type="text"
            className={Style.formInput}
            placeholder="שוש / אבא / לקוח"
          />
        </div>

        {/* Location */}
        <div className={Style.formGroup}>
          <label htmlFor="location">מיקום</label>
          <input
            ref={locationRef}
            id="location-input"
            className="task-input task-location"
            placeholder="הקלד כתובת או מקום"
            type="text"
            name="location"
          />
        </div>

        <TaskLocationPicker onLocationSelected={handleSelect} />

        {/* Requested file */}
        <div className={Style.formGroup}>
          <label htmlFor="requested_file">קובץ מצורף / נדרש</label>
          <input
            id="requested_file"
            name="requested_file"
            type="file"
            className={Style.formInput}
            placeholder="חשבונית / חוזה / PDF"
          />
        </div>

        {/* Submit */}
        <div className={Style.formActions}>
          <button
            type="submit"
            className={Style.btnPrimary}
          >
            💾 שמור משימה
          </button>
        </div>
      </form>
    </div>
  );
}
