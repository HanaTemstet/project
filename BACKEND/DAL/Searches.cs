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
    
    public partial class Searches
    {
        public int Id { get; set; }
        public int Category { get; set; }
        public string Adress { get; set; }
        public string fingerPrint { get; set; }
    
        public virtual CategoryGMH CategoryGMH { get; set; }
    }
}
