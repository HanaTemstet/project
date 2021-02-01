//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class PRODUCTtoGMH
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public PRODUCTtoGMH()
        {
            this.Images = new HashSet<Images>();
            this.LENDINGS = new HashSet<LENDINGS>();
        }
    
        public int ProductCodeToGMH { get; set; }
        public int ProductCode { get; set; }
        public int GmhCode { get; set; }
        public byte[] Picture { get; set; }
        public Nullable<int> Amount { get; set; }
        public string FreeDescription { get; set; }
        public bool IsDisposable { get; set; }
        public Nullable<int> SecurityDepositAmount { get; set; }
        public string Status { get; set; }
    
        public virtual GMH GMH { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Images> Images { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<LENDINGS> LENDINGS { get; set; }
        public virtual Products Products { get; set; }
    }
}
